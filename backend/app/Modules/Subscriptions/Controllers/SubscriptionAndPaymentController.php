<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Controllers;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Payments\Domain\Models\Payment;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use App\Modules\Subscriptions\Requests\InitiatePaymentCheckoutRequest;
use App\Modules\Subscriptions\Services\SubscriptionAndBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

final class SubscriptionAndPaymentController
{
    public function __construct(
        private readonly SubscriptionAndBillingService $billingService
    ) {}

    public function listPlans(): JsonResponse
    {
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('price_bdt')
            ->get();

        return ApiResponse::success(
            data: ['plans' => $plans],
            message: 'সাবস্ক্রিপশন প্ল্যান তালিকা লোড হয়েছে।'
        );
    }

    public function status(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->account_type === AccountType::Student) {
            /** @var StudentProfile $student */
            $student = StudentProfile::query()->where('user_id', $user->id)->firstOrFail();

            return ApiResponse::success(
                data: [
                    'quota' => $this->billingService->getStudentQuotaStatus($student),
                ],
                message: 'শিক্ষার্থীর বর্তমান কোটা ও প্ল্যান তথ্য লোড হয়েছে।'
            );
        }

        /** @var GuardianProfile $guardian */
        $guardian = GuardianProfile::query()->where('user_id', $user->id)->firstOrFail();

        $subscriptions = Subscription::query()
            ->with(['plan', 'student'])
            ->where('guardian_id', $guardian->id)
            ->orderByDesc('id')
            ->get();

        $payments = Payment::query()
            ->with('plan')
            ->where('guardian_id', $guardian->id)
            ->orderByDesc('id')
            ->limit(20)
            ->get();

        return ApiResponse::success(
            data: [
                'subscriptions' => $subscriptions,
                'payments' => $payments,
            ],
            message: 'অভিভাবকের সাবস্ক্রিপশন ও পেমেন্ট ইতিহাস লোড হয়েছে।'
        );
    }

    public function initiateCheckout(InitiatePaymentCheckoutRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var GuardianProfile $guardian */
        $guardian = GuardianProfile::query()->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validated();
        /** @var SubscriptionPlan $plan */
        $plan = SubscriptionPlan::query()
            ->where('code', (string) $validated['plan_code'])
            ->firstOrFail();

        $student = null;
        if (! empty($validated['student_code'])) {
            /** @var StudentProfile $targetStudent */
            $targetStudent = StudentProfile::query()
                ->where('student_code', (string) $validated['student_code'])
                ->firstOrFail();

            $isLinked = StudentGuardianLink::query()
                ->where('guardian_id', $guardian->id)
                ->where('student_id', $targetStudent->id)
                ->where('status', 'verified')
                ->exists();

            if (! $isLinked) {
                return ApiResponse::error(
                    code: 'GUARDIAN_STUDENT_FORBIDDEN',
                    message: 'এই শিক্ষার্থীর জন্য পেমেন্ট করার অনুমতি আপনার নেই।',
                    status: 403
                );
            }
            $student = $targetStudent;
        }

        $checkout = $this->billingService->initiateCheckout(
            guardian: $guardian,
            plan: $plan,
            gatewayName: (string) $validated['gateway'],
            idempotencyKey: (string) $validated['idempotency_key'],
            student: $student
        );

        return ApiResponse::success(
            data: $checkout,
            message: 'পেমেন্ট গেটওয়ে চেকআউট তৈরি হয়েছে।',
            status: 201
        );
    }

    public function handleWebhook(Request $request, string $gateway): JsonResponse
    {
        $signatureHeader = (string) $request->header('X-Webhook-Signature', '');
        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        try {
            $result = $this->billingService->handleWebhook($gateway, $payload, $signatureHeader);
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(
                code: 'INVALID_WEBHOOK_SIGNATURE',
                message: $e->getMessage(),
                status: 400
            );
        }

        return ApiResponse::success(
            data: [
                'merchant_invoice_no' => $result['payment']->merchant_invoice_no,
                'payment_status' => $result['payment']->status,
                'subscription_id' => $result['subscription']?->id,
                'already_processed' => $result['already_processed'],
            ],
            message: 'ওয়েব-হুক সফলভাবে প্রক্রিয়াকরণ হয়েছে।'
        );
    }
}
