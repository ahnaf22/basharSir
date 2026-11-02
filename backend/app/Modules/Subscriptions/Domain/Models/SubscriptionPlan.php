<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name_bn
 * @property string $name_en
 * @property string $tier
 * @property int $price_bdt
 * @property string $billing_cycle
 * @property int $daily_ai_turns_limit
 * @property int $monthly_exams_limit
 * @property int $max_children_supported
 * @property array<int, string>|null $features_json
 * @property bool $is_active
 */
final class SubscriptionPlan extends Model
{
    protected $table = 'subscription_plans';

    protected $fillable = [
        'code',
        'name_bn',
        'name_en',
        'tier',
        'price_bdt',
        'billing_cycle',
        'daily_ai_turns_limit',
        'monthly_exams_limit',
        'max_children_supported',
        'features_json',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_bdt' => 'integer',
            'daily_ai_turns_limit' => 'integer',
            'monthly_exams_limit' => 'integer',
            'max_children_supported' => 'integer',
            'features_json' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<PlanEntitlement, $this>
     */
    public function entitlements(): HasMany
    {
        return $this->hasMany(PlanEntitlement::class, 'subscription_plan_id');
    }
}
