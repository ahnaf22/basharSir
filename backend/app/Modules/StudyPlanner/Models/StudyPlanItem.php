<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Models;

use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Curriculum\Models\Topic;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $study_plan_id
 * @property int $student_id
 * @property int $subject_id
 * @property int $chapter_id
 * @property int|null $topic_id
 * @property int|null $learning_objective_id
 * @property string $task_type
 * @property string $title_bn
 * @property Carbon $scheduled_date
 * @property int $planned_minutes
 * @property int $actual_active_minutes
 * @property string $status
 * @property Carbon|null $rescheduled_from_date
 * @property Carbon|null $completed_at
 * @property-read StudyPlan $studyPlan
 * @property-read StudentProfile $student
 * @property-read Subject $subject
 * @property-read Chapter $chapter
 * @property-read Topic|null $topic
 * @property-read LearningObjective|null $learningObjective
 */
final class StudyPlanItem extends Model
{
    protected $table = 'study_plan_items';

    protected $fillable = [
        'study_plan_id',
        'student_id',
        'subject_id',
        'chapter_id',
        'topic_id',
        'learning_objective_id',
        'task_type',
        'title_bn',
        'scheduled_date',
        'planned_minutes',
        'actual_active_minutes',
        'status',
        'rescheduled_from_date',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'planned_minutes' => 'integer',
            'actual_active_minutes' => 'integer',
            'rescheduled_from_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<StudyPlan, $this>
     */
    public function studyPlan(): BelongsTo
    {
        return $this->belongsTo(StudyPlan::class, 'study_plan_id');
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * @return BelongsTo<Chapter, $this>
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class, 'chapter_id');
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * @return BelongsTo<LearningObjective, $this>
     */
    public function learningObjective(): BelongsTo
    {
        return $this->belongsTo(LearningObjective::class, 'learning_objective_id');
    }
}
