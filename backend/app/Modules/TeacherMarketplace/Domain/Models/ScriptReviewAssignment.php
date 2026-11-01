<?php

declare(strict_types=1);

namespace App\Modules\TeacherMarketplace\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $script_upload_id
 * @property int $teacher_id
 * @property int $reward_bdt
 * @property Carbon $sla_due_at
 * @property string $status
 * @property Carbon|null $completed_at
 */
final class ScriptReviewAssignment extends Model
{
    protected $table = 'script_review_assignments';

    protected $fillable = [
        'script_upload_id',
        'teacher_id',
        'reward_bdt',
        'sla_due_at',
        'status',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'script_upload_id' => 'integer',
            'teacher_id' => 'integer',
            'reward_bdt' => 'integer',
            'sla_due_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
