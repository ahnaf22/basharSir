<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $ai_request_id
 * @property int $student_id
 * @property string $source_type
 * @property int $source_id
 * @property string $reason_code
 * @property string|null $student_comment
 * @property string $status
 */
final class AiQualityFlag extends Model
{
    protected $table = 'ai_quality_flags';

    protected $fillable = [
        'ai_request_id',
        'student_id',
        'source_type',
        'source_id',
        'reason_code',
        'student_comment',
        'status',
    ];

    /**
     * @return BelongsTo<AiRequest, $this>
     */
    public function aiRequest(): BelongsTo
    {
        return $this->belongsTo(AiRequest::class, 'ai_request_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }
}
