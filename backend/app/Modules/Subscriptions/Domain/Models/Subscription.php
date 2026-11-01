<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Domain\Models;

use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guardian_id
 * @property int|null $student_id
 * @property int $subscription_plan_id
 * @property string $status
 * @property Carbon $starts_at
 * @property Carbon $expires_at
 * @property bool $auto_renew
 * @property-read SubscriptionPlan $plan
 */
final class Subscription extends Model
{
    protected $table = 'subscriptions';

    protected $fillable = [
        'guardian_id',
        'student_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'expires_at',
        'auto_renew',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'guardian_id' => 'integer',
            'student_id' => 'integer',
            'subscription_plan_id' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'auto_renew' => 'boolean',
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
     * @return BelongsTo<GuardianProfile, $this>
     */
    public function guardian(): BelongsTo
    {
        return $this->belongsTo(GuardianProfile::class, 'guardian_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }
}
