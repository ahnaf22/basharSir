<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Resources;

use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StudyPlan
 */
final class StudyPlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'curriculum_version_id' => $this->curriculum_version_id,
            'title' => $this->title,
            'target_completion_date' => $this->target_completion_date->toDateString(),
            'daily_study_minutes' => $this->daily_study_minutes,
            'status' => $this->status,
            'completion_percentage' => (float) $this->completion_percentage,
            'config_json' => $this->config_json,
            'items' => $this->items->map(fn (StudyPlanItem $item): array => [
                'id' => $item->id,
                'study_plan_id' => $item->study_plan_id,
                'subject_id' => $item->subject_id,
                'chapter_id' => $item->chapter_id,
                'topic_id' => $item->topic_id,
                'learning_objective_id' => $item->learning_objective_id,
                'task_type' => $item->task_type,
                'title_bn' => $item->title_bn,
                'scheduled_date' => $item->scheduled_date->toDateString(),
                'planned_minutes' => $item->planned_minutes,
                'actual_active_minutes' => $item->actual_active_minutes,
                'status' => $item->status,
                'rescheduled_from_date' => $item->rescheduled_from_date?->toDateString(),
                'completed_at' => $item->completed_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }
}
