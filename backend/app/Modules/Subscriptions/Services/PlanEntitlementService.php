<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Services;

use App\Models\User;
use App\Modules\AI\Models\UsageLedger;
use App\Modules\Evaluation\Domain\Models\ScriptUpload;
use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Subscriptions\Domain\Models\PlanEntitlement;
use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use Illuminate\Support\Carbon;

final class PlanEntitlementService
{
    public function __construct(
        private readonly SubscriptionAndBillingService $billingService
    ) {}

    public function resolveEffectivePlanForUser(User $user, ?StudentProfile $student = null): SubscriptionPlan
    {
        if ($user->account_type === AccountType::Student) {
            $studentProfile = $student ?? StudentProfile::query()->where('user_id', $user->id)->first();
            if ($studentProfile !== null) {
                return $this->billingService->resolveEffectivePlanForStudent($studentProfile);
            }
        }

        if ($user->account_type === AccountType::Guardian) {
            $guardianProfile = GuardianProfile::query()->where('user_id', $user->id)->first();
            if ($guardianProfile !== null) {
                /** @var Subscription|null $activeSub */
                $activeSub = Subscription::query()
                    ->with('plan')
                    ->where('guardian_id', $guardianProfile->id)
                    ->where('status', 'active')
                    ->where('expires_at', '>', Carbon::now())
                    ->orderByDesc('id')
                    ->first();

                if ($activeSub !== null) {
                    return $activeSub->plan;
                }
            }
        }

        /** @var SubscriptionPlan $freePlan */
        $freePlan = SubscriptionPlan::query()->where('tier', 'free')->first()
            ?? $this->billingService->resolveEffectivePlanForStudent(new StudentProfile);

        return $freePlan;
    }

    public function getEntitlement(User $user, string $featureKey, ?StudentProfile $student = null): ?PlanEntitlement
    {
        $plan = $this->resolveEffectivePlanForUser($user, $student);

        /** @var PlanEntitlement|null $entitlement */
        $entitlement = PlanEntitlement::query()
            ->where('subscription_plan_id', $plan->id)
            ->where('feature_key', $featureKey)
            ->first();

        return $entitlement;
    }

    /**
     * @return array{
     *   allowed: bool,
     *   reason_bn: string|null,
     *   upgrade_to: string|null,
     *   feature_key: string,
     *   quota: array<string, mixed>|null
     * }
     */
    public function canAccessFeature(User $user, string $featureKey, ?StudentProfile $student = null): array
    {
        $plan = $this->resolveEffectivePlanForUser($user, $student);
        $entitlement = $this->getEntitlement($user, $featureKey, $student);

        if ($entitlement === null || ! $entitlement->is_enabled) {
            return [
                'allowed' => false,
                'reason_bn' => 'এই সুবিধাটি আপনার বর্তমান প্ল্যানে অন্তর্ভুক্ত নেই। আনলক করতে প্ল্যান আপগ্রেড করুন।',
                'upgrade_to' => $this->recommendUpgradePlan($featureKey, $plan),
                'feature_key' => $featureKey,
                'quota' => null,
            ];
        }

        // Quota-checked features
        if ($featureKey === 'ai_tutor.daily_turns') {
            $studentProfile = $student ?? StudentProfile::query()->where('user_id', $user->id)->first();
            $limit = $entitlement->quota_limit ?? $plan->daily_ai_turns_limit;
            $used = 0;
            if ($studentProfile !== null) {
                $used = (int) UsageLedger::query()
                    ->where('student_id', $studentProfile->id)
                    ->whereDate('usage_date', '=', Carbon::today()->toDateString())
                    ->sum('ai_turns_used');
            }

            $allowed = $used < $limit;

            return [
                'allowed' => $allowed,
                'reason_bn' => $allowed ? null : 'আজকের দৈনিক এআই টিউটর অনুশীলনের কোটা পূর্ণ হয়েছে। আনলিমিটেড অনুশীলনের জন্য প্রিমিয়ামে আপগ্রেড করুন।',
                'upgrade_to' => $allowed ? null : 'basic',
                'feature_key' => $featureKey,
                'quota' => ['used' => $used, 'limit' => $limit, 'remaining' => max(0, $limit - $used)],
            ];
        }

        if ($featureKey === 'exams.monthly') {
            $studentProfile = $student ?? StudentProfile::query()->where('user_id', $user->id)->first();
            $limit = $entitlement->quota_limit ?? $plan->monthly_exams_limit;
            $used = 0;
            if ($studentProfile !== null) {
                $used = (int) ExamAttempt::query()
                    ->where('student_id', $studentProfile->id)
                    ->where('started_at', '>=', Carbon::now()->startOfMonth())
                    ->count();
            }

            $allowed = $used < $limit;

            return [
                'allowed' => $allowed,
                'reason_bn' => $allowed ? null : 'চলতি মাসের পরীক্ষার কোটা পূর্ণ হয়েছে। আরও পরীক্ষা দিতে প্ল্যান আপগ্রেড করুন।',
                'upgrade_to' => $allowed ? null : 'basic',
                'feature_key' => $featureKey,
                'quota' => ['used' => $used, 'limit' => $limit, 'remaining' => max(0, $limit - $used)],
            ];
        }

        if ($featureKey === 'handwriting_ocr.monthly') {
            $studentProfile = $student ?? StudentProfile::query()->where('user_id', $user->id)->first();
            $limit = $entitlement->quota_limit ?? 0;
            $used = 0;
            if ($studentProfile !== null) {
                $used = (int) ScriptUpload::query()
                    ->where('student_id', $studentProfile->id)
                    ->where('created_at', '>=', Carbon::now()->startOfMonth())
                    ->count();
            }

            $allowed = $used < $limit;

            return [
                'allowed' => $allowed,
                'reason_bn' => $allowed ? null : 'চলতি মাসের হাতের লেখার উত্তরপত্র স্ক্যানের কোটা শেষ হয়েছে। প্রিমিয়াম প্ল্যানে আপগ্রেড করুন।',
                'upgrade_to' => $allowed ? null : 'premium',
                'feature_key' => $featureKey,
                'quota' => ['used' => $used, 'limit' => $limit, 'remaining' => max(0, $limit - $used)],
            ];
        }

        if ($featureKey === 'guardian.max_children') {
            $guardianProfile = GuardianProfile::query()->where('user_id', $user->id)->first();
            $limit = $entitlement->quota_limit ?? $plan->max_children_supported;
            $used = 0;
            if ($guardianProfile !== null) {
                $used = (int) StudentGuardianLink::query()
                    ->where('guardian_id', $guardianProfile->id)
                    ->where('status', 'verified')
                    ->count();
            }

            $allowed = $used < $limit;

            return [
                'allowed' => $allowed,
                'reason_bn' => $allowed ? null : "আপনার বর্তমান প্ল্যানে সর্বোচ্চ {$limit} জন সন্তান যুক্ত করার সুযোগ রয়েছে। অতিরিক্ত সন্তান যুক্ত করতে ফ্যামিলি প্ল্যানে আপগ্রেড করুন।",
                'upgrade_to' => $allowed ? null : 'family',
                'feature_key' => $featureKey,
                'quota' => ['used' => $used, 'limit' => $limit, 'remaining' => max(0, $limit - $used)],
            ];
        }

        return [
            'allowed' => true,
            'reason_bn' => null,
            'upgrade_to' => null,
            'feature_key' => $featureKey,
            'quota' => null,
        ];
    }

    private function recommendUpgradePlan(string $featureKey, SubscriptionPlan $currentPlan): string
    {
        if (in_array($featureKey, ['teacher_marketplace.booking', 'group_learning.create'], true)) {
            return 'premium';
        }

        if ($featureKey === 'guardian.max_children' && $currentPlan->tier !== 'free') {
            return 'family';
        }

        return 'basic';
    }

    /**
     * @return array<string, mixed>
     */
    public function getEntitlementsSnapshot(User $user, ?StudentProfile $student = null): array
    {
        $plan = $this->resolveEffectivePlanForUser($user, $student);
        $entitlements = PlanEntitlement::query()
            ->where('subscription_plan_id', $plan->id)
            ->get();

        $features = [];
        foreach ($entitlements as $ent) {
            $access = $this->canAccessFeature($user, $ent->feature_key, $student);
            $features[$ent->feature_key] = [
                'is_enabled' => $ent->is_enabled,
                'quota_limit' => $ent->quota_limit,
                'description_bn' => $ent->description_bn,
                'can_access' => $access['allowed'],
                'quota' => $access['quota'],
                'upgrade_to' => $access['upgrade_to'],
            ];
        }

        return [
            'plan' => [
                'id' => $plan->id,
                'code' => $plan->code,
                'name_bn' => $plan->name_bn,
                'name_en' => $plan->name_en,
                'tier' => $plan->tier,
                'price_bdt' => $plan->price_bdt,
                'billing_cycle' => $plan->billing_cycle,
                'max_children_supported' => $plan->max_children_supported,
            ],
            'features' => $features,
        ];
    }
}
