<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Middleware;

use App\Core\Support\ApiResponse;
use App\Models\User;
use App\Modules\Subscriptions\Services\PlanEntitlementService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureFeatureEntitledMiddleware
{
    public function __construct(
        private readonly PlanEntitlementService $entitlementService
    ) {}

    public function handle(Request $request, Closure $next, string $featureKey): Response
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

        $access = $this->entitlementService->canAccessFeature($user, $featureKey);

        if (! $access['allowed']) {
            return ApiResponse::error(
                code: 'PLAN_FEATURE_LOCKED',
                message: $access['reason_bn'] ?? 'এই সুবিধাটি আপনার বর্তমান সাবস্ক্রিপশন প্ল্যানে উপলব্ধ নয়।',
                status: 403,
                details: [
                    'feature_key' => $featureKey,
                    'upgrade_to' => $access['upgrade_to'],
                    'quota' => $access['quota'],
                ]
            );
        }

        return $next($request);
    }
}

