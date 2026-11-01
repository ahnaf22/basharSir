<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $learning_resource_id
 * @property bool $is_bookmarked
 * @property array<int, string>|null $highlights_json
 * @property string|null $personal_note_markdown
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'student_id',
    'learning_resource_id',
    'is_bookmarked',
    'highlights_json',
    'personal_note_markdown',
])]
class StudentResourceAnnotation extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_bookmarked' => 'boolean',
            'highlights_json' => 'array',
        ];
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * @return BelongsTo<LearningResource, $this>
     */
    public function learningResource(): BelongsTo
    {
        return $this->belongsTo(LearningResource::class, 'learning_resource_id');
    }
}
