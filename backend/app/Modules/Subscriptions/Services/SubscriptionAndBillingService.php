<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Services;

use App\Modules\AI\Models\UsageLedger;
use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Payments\Contracts\PaymentGatewayInterface;
use App\Modules\Payments\Domain\Models\Payment;
use App\Modules\Payments\Gateways\BkashGateway;
use App\Modules\Payments\Gateways\NagadGateway;
use App\Modules\Payments\Gateways\SslCommerzGateway;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class SubscriptionAndBillingService
{
    public function resolveGateway(string $gateway): PaymentGatewayInterface
    {
        return match (strtolower($gateway)) {
            'bkash' => new BkashGateway,
            'nagad' => new NagadGateway,
            'sslcommerz' => new SslCommerzGateway,
            default => throw new InvalidArgumentException("Unsupported payment gateway: {$gateway}"),
        };
    }

    /**
     * @return array{
     *   payment_uuid: string,
     *   merchant_invoice_no: string,
     *   gateway: string,
     *   amount_bdt: int,
     *   status: string,
     *   checkout_url: string
     * }
     */
    public function initiateCheckout(
        GuardianProfile $guardian,
        SubscriptionPlan $plan,
        string $gatewayName,
        string $idempotencyKey,
        ?StudentProfile $student = null
    ): array {
        $existing = Payment::query()
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        $gateway = $this->resolveGateway($gatewayName);

        if ($existing !== null) {
            $checkout = $gateway->initiateCheckout($existing);

            return [
                'payment_uuid' => $existing->uuid,
                'merchant_invoice_no' => $existing->merchant_invoice_no,
                'gateway' => $existing->gateway,
                'amount_bdt' => $existing->amount_bdt,
                'status' => $existing->status,
                'checkout_url' => $checkout['checkout_url'],
            ];
        }

        return DB::transaction(function () use ($guardian, $plan, $gateway, $idempotencyKey, $student): array {
            $invoiceNo = 'INV-'.now()->format('Ymd').'-'.strtoupper(Str::random(8));

            $payment = Payment::query()->create([
                'uuid' => (string) Str::uuid(),
                'guardian_id' => $guardian->id,
                'subscription_plan_id' => $plan->id,
                'student_id' => $student?->id,
                'gateway' => $gateway->gatewayName(),
                'merchant_invoice_no' => $invoiceNo,
                'amount_bdt' => $plan->price_bdt,
                'currency' => 'BDT',
                'status' => 'initiated',
                'idempotency_key' => $idempotencyKey,
                'webhook_signature_verified' => false,
            ]);

            $checkout = $gateway->initiateCheckout($payment);

            return [
                'payment_uuid' => $payment->uuid,
                'merchant_invoice_no' => $payment->merchant_invoice_no,
                'gateway' => $payment->gateway,
                'amount_bdt' => $payment->amount_bdt,
                'status' => $payment->status,
                'checkout_url' => $checkout['checkout_url'],
            ];
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *   payment: Payment,
     *   subscription: Subscription|null,
     *   already_processed: bool
     * }
     */
    public function handleWebhook(string $gatewayName, array $payload, string $signatureHeader): array
    {
        $gateway = $this->resolveGateway($gatewayName);

        if (! $gateway->verifyWebhookSignature($payload, $signatureHeader)) {
            throw new InvalidArgumentException('Invalid webhook signature.');
        }

        $invoiceNo = (string) ($payload['merchant_invoice_no'] ?? '');
        $trxId = (string) ($payload['gateway_trx_id'] ?? '');
        $webhookStatus = strtolower((string) ($payload['status'] ?? 'failed'));

        /** @var Payment $payment */
        $payment = Payment::query()
            ->where('merchant_invoice_no', $invoiceNo)
            ->where('gateway', $gateway->gatewayName())
            ->firstOrFail();

        if ($payment->status === 'completed') {
            /** @var Subscription|null $existingSub */
            $existingSub = $payment->subscription_id !== null
                ? Subscription::query()->find($payment->subscription_id)
                : null;

            return [
                'payment' => $payment,
                'subscription' => $existingSub,
                'already_processed' => true,
            ];
        }

        return DB::transaction(function () use ($payment, $trxId, $webhookStatus, $payload): array {
            if ($webhookStatus !== 'completed' && $webhookStatus !== 'success') {
                $payment->update([
                    'status' => 'failed',
                    'gateway_trx_id' => $trxId !== '' ? $trxId : null,
                    'webhook_signature_verified' => true,
                    'raw_webhook_payload_json' => $payload,
                ]);

                return [
                    'payment' => $payment->fresh() ?? $payment,
                    'subscription' => null,
                    'already_processed' => false,
                ];
            }

            /** @var SubscriptionPlan $plan */
            $plan = SubscriptionPlan::query()->findOrFail($payment->subscription_plan_id);
            $startsAt = Carbon::now();
            $expiresAt = $plan->billing_cycle === 'yearly'
                ? $startsAt->copy()->addYear()
                : $startsAt->copy()->addDays(30);

            Subscription::query()
                ->where('guardian_id', $payment->guardian_id)
                ->where('student_id', $payment->student_id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            $subscription = Subscription::query()->create([
                'guardian_id' => $payment->guardian_id,
                'student_id' => $payment->student_id,
                'subscription_plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'auto_renew' => true,
            ]);

            $payment->update([
                'subscription_id' => $subscription->id,
                'gateway_trx_id' => $trxId,
                'status' => 'completed',
                'webhook_signature_verified' => true,
                'raw_webhook_payload_json' => $payload,
                'paid_at' => $startsAt,
            ]);

            return [
                'payment' => $payment->fresh() ?? $payment,
                'subscription' => $subscription,
                'already_processed' => false,
            ];
        });
    }

    public function resolveEffectivePlanForStudent(StudentProfile $student): SubscriptionPlan
    {
        $directSubscription = Subscription::query()
            ->with('plan')
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if ($directSubscription !== null && $directSubscription->plan !== null) {
            return $directSubscription->plan;
        }

        $guardianIds = StudentGuardianLink::query()
            ->where('student_id', $student->id)
            ->where('status', 'verified')
            ->pluck('guardian_id')
            ->all();

        if ($guardianIds !== []) {
            $familySubscription = Subscription::query()
                ->with('plan')
                ->whereIn('guardian_id', $guardianIds)
                ->whereNull('student_id')
                ->where('status', 'active')
                ->where('expires_at', '>', Carbon::now())
                ->orderByDesc('id')
                ->first();

            if ($familySubscription !== null && $familySubscription->plan !== null) {
                return $familySubscription->plan;
            }
        }

        /** @var SubscriptionPlan|null $freePlan */
        $freePlan = SubscriptionPlan::query()
            ->where('tier', 'free')
            ->first();

        if ($freePlan !== null) {
            return $freePlan;
        }

        return SubscriptionPlan::query()->create([
            'code' => 'PLAN-FREE-MONTHLY',
            'name_bn' => 'ফ্রি ট্রায়াল (Free Tier)',
            'name_en' => 'Free Tier',
            'tier' => 'free',
            'price_bdt' => 0,
            'billing_cycle' => 'monthly',
            'daily_ai_turns_limit' => 15,
            'monthly_exams_limit' => 2,
            'max_children_supported' => 1,
            'features_json' => ['দৈনিক ১৫টি এআই টিউটর টার্ন'],
            'is_active' => true,
        ]);
    }

    /**
     * @return array{
     *   plan_code: string,
     *   plan_name_bn: string,
     *   tier: string,
     *   price_bdt: int,
     *   daily_ai_turns_used: int,
     *   daily_ai_turns_limit: int,
     *   monthly_exams_used: int,
     *   monthly_exams_limit: int,
     *   can_use_ai_tutor: bool,
     *   can_start_exam: bool
     * }
     */
    public function getStudentQuotaStatus(StudentProfile $student): array
    {
        $plan = $this->resolveEffectivePlanForStudent($student);

        $dailyAiTurnsUsed = UsageLedger::query()
            ->where('student_id', $student->id)
            ->whereDate('usage_date', '=', Carbon::today()->toDateString())
            ->sum('ai_turns_used');

        $monthlyExamsUsed = ExamAttempt::query()
            ->where('student_id', $student->id)
            ->where('started_at', '>=', Carbon::now()->startOfMonth())
            ->count();

        $turnsUsed = (int) $dailyAiTurnsUsed;
        $examsUsed = (int) $monthlyExamsUsed;

        return [
            'plan_code' => $plan->code,
            'plan_name_bn' => $plan->name_bn,
            'tier' => $plan->tier,
            'price_bdt' => $plan->price_bdt,
            'daily_ai_turns_used' => $turnsUsed,
            'daily_ai_turns_limit' => $plan->daily_ai_turns_limit,
            'monthly_exams_used' => $examsUsed,
            'monthly_exams_limit' => $plan->monthly_exams_limit,
            'can_use_ai_tutor' => $turnsUsed < $plan->daily_ai_turns_limit,
            'can_start_exam' => $examsUsed < $plan->monthly_exams_limit,
        ];
    }
}
