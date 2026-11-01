<?php

declare(strict_types=1);

namespace App\Modules\TeacherMarketplace\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $uuid
 * @property int $teacher_id
 * @property int $guardian_id
 * @property int $student_id
 * @property int $learning_objective_id
 * @property string $session_mode
 * @property Carbon $scheduled_at
 * @property int $duration_minutes
 * @property int $agreed_fee_bdt
 * @property int $platform_commission_bdt
 * @property int $teacher_payout_bdt
 * @property string $escrow_status
 * @property array<string, mixed> $ai_diagnostic_brief_json
 * @property string $status
 */
final class TeacherBooking extends Model
{
    protected $table = 'teacher_bookings';

    protected $fillable = [
        'uuid',
        'teacher_id',
        'guardian_id',
        'student_id',
        'learning_objective_id',
        'session_mode',
        'scheduled_at',
        'duration_minutes',
        'agreed_fee_bdt',
        'platform_commission_bdt',
        'teacher_payout_bdt',
        'escrow_status',
        'ai_diagnostic_brief_json',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'teacher_id' => 'integer',
            'guardian_id' => 'integer',
            'student_id' => 'integer',
            'learning_objective_id' => 'integer',
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'agreed_fee_bdt' => 'integer',
            'platform_commission_bdt' => 'integer',
            'teacher_payout_bdt' => 'integer',
            'ai_diagnostic_brief_json' => 'array',
        ];
    }
}
