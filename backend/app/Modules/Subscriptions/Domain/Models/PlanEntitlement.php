<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $subscription_plan_id
 * @property string $feature_key
 * @property bool $is_enabled
 * @property int|null $quota_limit
 * @property string|null $description_bn
 */
final class PlanEntitlement extends Model
{
    protected $table = 'plan_entitlements';

    protected $fillable = [
        'subscription_plan_id',
        'feature_key',
        'is_enabled',
        'quota_limit',
        'description_bn',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subscription_plan_id' => 'integer',
            'is_enabled' => 'boolean',
            'quota_limit' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<SubscriptionPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }
}

