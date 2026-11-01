<?php

declare(strict_types=1);

namespace App\Modules\Payments\Domain\Models;

use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property int $guardian_id
 * @property int|null $subscription_id
 * @property int $subscription_plan_id
 * @property int|null $student_id
 * @property string $gateway
 * @property string $merchant_invoice_no
 * @property string|null $gateway_trx_id
 * @property int $amount_bdt
 * @property string $currency
 * @property string $status
 * @property string $idempotency_key
 * @property bool $webhook_signature_verified
 * @property array<string, mixed>|null $raw_webhook_payload_json
 * @property Carbon|null $paid_at
 * @property-read SubscriptionPlan $plan
 */
final class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'uuid',
        'guardian_id',
        'subscription_id',
        'subscription_plan_id',
        'student_id',
        'gateway',
        'merchant_invoice_no',
        'gateway_trx_id',
        'amount_bdt',
        'currency',
        'status',
        'idempotency_key',
        'webhook_signature_verified',
        'raw_webhook_payload_json',
        'paid_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'guardian_id' => 'integer',
            'subscription_id' => 'integer',
            'subscription_plan_id' => 'integer',
            'student_id' => 'integer',
            'amount_bdt' => 'integer',
            'webhook_signature_verified' => 'boolean',
            'raw_webhook_payload_json' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<SubscriptionPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * @return BelongsTo<Subscription, $this>
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }
}
