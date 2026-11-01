<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Resources;

use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\Tutoring\Enums\TutorLessonStage;
use App\Modules\Tutoring\Models\TutorMessage;
use App\Modules\Tutoring\Models\TutorSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TutorSession
 */
final class TutorSessionResource extends JsonResource
{
    public function __construct(
        TutorSession $resource,
        private readonly ?MasteryRecord $masteryRecord = null,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $stageEnum = TutorLessonStage::tryFrom($this->current_stage) ?? TutorLessonStage::START_LESSON;

        /** @var TutorMessage|null $latestTutorMessage */
        $latestTutorMessage = $this->messages
            ->where('sender_role', 'tutor')
            ->sortByDesc('id')
            ->first();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'student_id' => $this->student_id,
            'curriculum_version_id' => $this->curriculum_version_id,
            'topic_id' => $this->topic_id,
            'active_objective_id' => $this->active_objective_id,
            'objective' => [
                'id' => $this->activeObjective->id,
                'code' => $this->activeObjective->code,
                'title_bn' => $this->activeObjective->title_bn,
                'title_en' => $this->activeObjective->title_en,
                'bloom_level' => $this->activeObjective->bloom_level,
                'mastery_threshold_pct' => $this->activeObjective->mastery_threshold_pct,
            ],
            'current_stage' => $this->current_stage,
            'pedagogical_step' => $stageEnum->pedagogicalRailStep(),
            'stage_label_bn' => $stageEnum->labelBn(),
            'session_status' => $this->session_status,
            'state_metadata' => $this->state_metadata_json,
            'active_duration_seconds' => $this->active_duration_seconds,
            'mastery' => [
                'score' => $this->masteryRecord !== null ? (float) $this->masteryRecord->mastery_score : 0.0,
                'status' => $this->masteryRecord !== null ? $this->masteryRecord->mastery_status : 'unstarted',
                'attempts_count' => $this->masteryRecord !== null ? $this->masteryRecord->attempts_count : 0,
                'correct_count' => $this->masteryRecord !== null ? $this->masteryRecord->correct_count : 0,
            ],
            'latest_tutor_turn' => $latestTutorMessage !== null ? [
                'id' => $latestTutorMessage->id,
                'lesson_stage' => $latestTutorMessage->lesson_stage,
                'hints_used_count' => $latestTutorMessage->hints_used_count,
                'payload' => $latestTutorMessage->structured_payload_json,
            ] : null,
            'messages' => $this->messages->map(fn (TutorMessage $msg): array => [
                'id' => $msg->id,
                'client_turn_id' => $msg->client_turn_id,
                'sender_role' => $msg->sender_role,
                'lesson_stage' => $msg->lesson_stage,
                'student_action_type' => $msg->student_action_type,
                'student_input_text' => $msg->student_input_text,
                'structured_payload_json' => $msg->structured_payload_json,
                'is_answer_correct' => $msg->is_answer_correct,
                'misconception_code' => $msg->misconception_code,
                'hints_used_count' => $msg->hints_used_count,
                'created_at' => $msg->created_at?->toIso8601String(),
            ])->values()->all(),
            'started_at' => $this->started_at->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
        ];
    }
}
