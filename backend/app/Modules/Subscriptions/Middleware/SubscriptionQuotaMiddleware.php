<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Middleware;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Services\SubscriptionAndBillingService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class SubscriptionQuotaMiddleware
{
    public function __construct(
        private readonly SubscriptionAndBillingService $billingService
    ) {}

    public function handle(Request $request, Closure $next, string $feature = 'ai_tutor'): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if ($user === null) {
            return ApiResponse::error(
                code: 'UNAUTHENTICATED',
                message: 'লগইন আবশ্যক।',
                status: 401
            );
        }

        /** @var StudentProfile|null $student */
        $student = StudentProfile::query()->where('user_id', $user->id)->first();
        if ($student === null) {
            return $next($request);
        }

        $quota = $this->billingService->getStudentQuotaStatus($student);

        if ($feature === 'ai_tutor' && ! $quota['can_use_ai_tutor']) {
            return ApiResponse::error(
                code: 'DAILY_AI_QUOTA_EXCEEDED',
                message: 'আজকের দৈনিক এআই টিউটর কোটা শেষ হয়েছে। আনলিমিটেড অনুশীলনের জন্য প্ল্যান আপগ্রেড করো।',
                status: 429,
                details: ['quota' => $quota]
            );
        }

        if ($feature === 'exam' && ! $quota['can_start_exam']) {
            return ApiResponse::error(
                code: 'MONTHLY_EXAM_QUOTA_EXCEEDED',
                message: 'চলতি মাসের পরীক্ষার কোটা শেষ হয়েছে। আরও পরীক্ষায় অংশ নিতে প্ল্যান আপগ্রেড করো।',
                status: 429,
                details: ['quota' => $quota]
            );
        }

        return $next($request);
    }
}
