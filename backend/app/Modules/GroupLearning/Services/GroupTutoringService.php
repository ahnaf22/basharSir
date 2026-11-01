<?php

declare(strict_types=1);

namespace App\Modules\GroupLearning\Services;

use App\Modules\AI\Services\PiiScrubberService;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\GroupLearning\Domain\Models\GroupBroadcastQuestion;
use App\Modules\GroupLearning\Domain\Models\GroupBroadcastResponse;
use App\Modules\GroupLearning\Domain\Models\GroupIndividualAssistance;
use App\Modules\GroupLearning\Domain\Models\GroupParticipant;
use App\Modules\GroupLearning\Domain\Models\GroupSession;
use App\Modules\GroupLearning\Domain\Models\RaiseHandEvent;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

final class GroupTutoringService
{
    private readonly PiiScrubberService $piiScrubber;

    public function __construct(?PiiScrubberService $piiScrubber = null)
    {
        $this->piiScrubber = $piiScrubber ?? new PiiScrubberService;
    }

    public function createCohortSession(
        LearningObjective $objective,
        string $titleBn,
        int $targetClassLevel = 8,
        string $targetMedium = 'bangla',
        int $minParticipants = 3,
        int $maxParticipants = 5,
        ?string $joinCode = null,
        ?string $sharedBoardMarkdownBn = null
    ): GroupSession {
        if ($minParticipants < 2 || $maxParticipants > 5 || $minParticipants > $maxParticipants) {
            throw new InvalidArgumentException('গ্রুপ স্টাডি রুমে ৩ থেকে ৫ জন শিক্ষার্থীর কোহর্ট সীমা নির্ধারণ করতে হবে।');
        }

        $code = $joinCode ?? sprintf('GRP-%d%s-%s', $targetClassLevel, strtoupper(substr($targetMedium, 0, 1)), strtoupper(Str::random(4)));

        return GroupSession::query()->create([
            'uuid' => (string) Str::uuid(),
            'join_code' => $code,
            'learning_objective_id' => $objective->id,
            'title_bn' => $titleBn,
            'target_class_level' => $targetClassLevel,
            'target_medium' => $targetMedium,
            'min_participants' => $minParticipants,
            'max_participants' => $maxParticipants,
            'status' => 'live',
            'teaching_mode' => 'batch_mode',
            'current_lesson_stage' => 'EXPLAIN_CONCEPT',
            'shared_board_markdown_bn' => $sharedBoardMarkdownBn ?? sprintf(
                "### যৌথ পাঠ বোর্ড: %s\nজাতীয় শিক্ষাক্রম (NCTB) অনুযায়ী মূল সূত্র: $(a + b)^2 = a^2 + 2ab + b^2$ এবং সরল সমীকরণের পক্ষান্তর বিধি।",
                $objective->title_bn
            ),
            'scheduled_at' => Carbon::now(),
        ]);
    }

    public function joinCohortRoom(
        GroupSession $session,
        StudentProfile $student,
        string $pseudonymBn,
        ?string $joinCode = null
    ): GroupParticipant {
        return DB::transaction(function () use ($session, $student, $pseudonymBn, $joinCode): GroupParticipant {
            if ($session->join_code !== null && $joinCode !== null && $session->join_code !== $joinCode) {
                throw new InvalidArgumentException('গ্রুপ স্টাডি রুমের আমন্ত্রণ কোড (Join Code) সঠিক নয়।');
            }

            if ($student->current_class_level !== $session->target_class_level) {
                throw new InvalidArgumentException('শিশু সুরক্ষা নীতি অনুযায়ী শুধুমাত্র একই শ্রেণির সহপাঠীরা এই গ্রুপ স্টাডি রুমে যুক্ত হতে পারবে।');
            }

            $existing = GroupParticipant::query()
                ->where('group_session_id', $session->id)
                ->where('student_id', $student->id)
                ->first();

            if ($existing !== null) {
                if ($existing->is_kicked) {
                    throw new InvalidArgumentException('আচরণবিধি লঙ্ঘনের কারণে এই রুম থেকে তোমাকে অব্যাহতি দেওয়া হয়েছে।');
                }

                return $existing;
            }

            $currentCount = GroupParticipant::query()
                ->where('group_session_id', $session->id)
                ->where('is_kicked', false)
                ->count();

            if ($currentCount >= $session->max_participants) {
                throw new InvalidArgumentException('এই গ্রুপ স্টাডি রুমে সর্বোচ্চ ৫ জন শিক্ষার্থীর কোটা পূর্ণ হয়েছে।');
            }

            return GroupParticipant::query()->create([
                'group_session_id' => $session->id,
                'student_id' => $student->id,
                'pseudonym_bn' => $pseudonymBn,
                'is_kicked' => false,
                'joined_at' => Carbon::now(),
            ]);
        });
    }

    /**
     * @param  array<string, string>  $options
     */
    public function createBroadcastQuestion(
        GroupSession $session,
        string $stemBn,
        array $options,
        string $correctOptionKey,
        string $explanationBn
    ): GroupBroadcastQuestion {
        return GroupBroadcastQuestion::query()->create([
            'group_session_id' => $session->id,
            'stem_bn' => $stemBn,
            'options_json' => $options,
            'correct_option_key' => $correctOptionKey,
            'explanation_bn' => $explanationBn,
            'is_revealed' => false,
        ]);
    }

    public function submitBroadcastResponse(
        GroupBroadcastQuestion $question,
        StudentProfile $student,
        string $selectedOptionKey
    ): GroupBroadcastResponse {
        return DB::transaction(function () use ($question, $student, $selectedOptionKey): GroupBroadcastResponse {
            $isCorrect = trim($selectedOptionKey) === trim($question->correct_option_key);

            /** @var GroupBroadcastResponse $response */
            $response = GroupBroadcastResponse::query()->updateOrCreate(
                [
                    'broadcast_question_id' => $question->id,
                    'student_id' => $student->id,
                ],
                [
                    'selected_option_key' => $selectedOptionKey,
                    'is_correct' => $isCorrect,
                    'submitted_at' => Carbon::now(),
                ]
            );

            // Auto-reveal once all active (non-kicked) cohort participants have submitted
            $activeParticipantCount = GroupParticipant::query()
                ->where('group_session_id', $question->group_session_id)
                ->where('is_kicked', false)
                ->count();

            $responseCount = GroupBroadcastResponse::query()
                ->where('broadcast_question_id', $question->id)
                ->count();

            if ($activeParticipantCount > 0 && $responseCount >= $activeParticipantCount) {
                $question->update(['is_revealed' => true]);
            }

            return $response;
        });
    }

    public function revealBroadcastQuestion(GroupBroadcastQuestion $question): GroupBroadcastQuestion
    {
        $question->update(['is_revealed' => true]);

        return $question->fresh() ?? $question;
    }

    public function requestIndividualAssistance(
        GroupSession $session,
        StudentProfile $student,
        string $studentQuestionBn
    ): GroupIndividualAssistance {
        $safety = $this->piiScrubber->checkSafetyGuardrails($studentQuestionBn);
        if (! $safety->isSafe) {
            throw new InvalidArgumentException($safety->redirectMessageBn ?? 'নিরাপত্তা নীতিমালা লঙ্ঘিত হয়েছে।');
        }

        $scrubbed = $this->piiScrubber->scrub($studentQuestionBn, [$student->student_code]);

        $sideExplanationBn = sprintf(
            'একক সহায়তা (যৌথ পাঠ বোর্ড অপরিবর্তিত রেখে): তোমার প্রশ্ন "%s"-এর সহজ সমাধান ধাপ — প্রথমে সমীকরণের চলক পদগুলো বাম পাশে এবং সংখ্যাগুলো ডান পাশে পক্ষান্তর করো, তারপর সহগ দিয়ে ভাগ করো।',
            $scrubbed->sanitizedText
        );

        return GroupIndividualAssistance::query()->create([
            'group_session_id' => $session->id,
            'student_id' => $student->id,
            'student_question_bn' => $scrubbed->sanitizedText,
            'ai_side_explanation_bn' => $sideExplanationBn,
            'pii_redacted' => $scrubbed->redactedCount > 0,
        ]);
    }

    public function enqueueRaiseHand(
        GroupSession $session,
        StudentProfile $student,
        string $questionSummaryBn
    ): RaiseHandEvent {
        $safety = $this->piiScrubber->checkSafetyGuardrails($questionSummaryBn);
        if (! $safety->isSafe) {
            throw new InvalidArgumentException($safety->redirectMessageBn ?? 'নিরাপত্তা নীতিমালা লঙ্ঘিত হয়েছে।');
        }

        $scrubbed = $this->piiScrubber->scrub($questionSummaryBn, [$student->student_code]);

        return DB::transaction(function () use ($session, $student, $scrubbed): RaiseHandEvent {
            $maxPos = (int) RaiseHandEvent::query()
                ->where('group_session_id', $session->id)
                ->where('status', 'queued')
                ->max('queue_position');

            return RaiseHandEvent::query()->create([
                'group_session_id' => $session->id,
                'student_id' => $student->id,
                'question_summary_bn' => $scrubbed->sanitizedText,
                'pii_redacted' => $scrubbed->redactedCount > 0,
                'status' => 'queued',
                'queue_position' => $maxPos + 1,
            ]);
        });
    }

    public function resolveNextInQueue(
        GroupSession $session,
        string $responseBn
    ): ?RaiseHandEvent {
        return DB::transaction(function () use ($session, $responseBn): ?RaiseHandEvent {
            /** @var RaiseHandEvent|null $next */
            $next = RaiseHandEvent::query()
                ->where('group_session_id', $session->id)
                ->where('status', 'queued')
                ->orderBy('queue_position')
                ->orderBy('id')
                ->first();

            if ($next === null) {
                return null;
            }

            $next->update([
                'status' => 'answered',
                'ai_or_teacher_response_bn' => $responseBn,
                'resolved_at' => Carbon::now(),
            ]);

            $boardPrefix = $session->shared_board_markdown_bn ?? '';
            $session->update([
                'shared_board_markdown_bn' => trim($boardPrefix."\n\n**প্রশ্নোত্তর (FIFO):** ".$responseBn),
            ]);

            return $next->fresh() ?? $next;
        });
    }

    public function moderateParticipant(
        GroupParticipant $participant,
        bool $kick,
        string $reasonBn
    ): GroupParticipant {
        $participant->update([
            'is_kicked' => $kick,
            'moderation_reason_bn' => $reasonBn,
        ]);

        return $participant->fresh() ?? $participant;
    }

    /**
     * @return array<string, mixed>
     */
    public function getRoomSnapshot(GroupSession $session, ?StudentProfile $viewer = null): array
    {
        $participants = GroupParticipant::query()
            ->where('group_session_id', $session->id)
            ->orderBy('id')
            ->get();

        $raiseHandQueue = RaiseHandEvent::query()
            ->where('group_session_id', $session->id)
            ->orderBy('queue_position')
            ->orderBy('id')
            ->get();

        $questionModels = GroupBroadcastQuestion::query()
            ->where('group_session_id', $session->id)
            ->orderBy('id')
            ->get();

        $broadcastQuestions = [];
        foreach ($questionModels as $q) {
            $totalResponses = GroupBroadcastResponse::query()
                ->where('broadcast_question_id', $q->id)
                ->count();
            $correctResponses = GroupBroadcastResponse::query()
                ->where('broadcast_question_id', $q->id)
                ->where('is_correct', true)
                ->count();

            $broadcastQuestions[] = [
                'id' => $q->id,
                'stem_bn' => $q->stem_bn,
                'options' => $q->options_json,
                'is_revealed' => $q->is_revealed,
                'correct_option_key' => $q->is_revealed ? $q->correct_option_key : null,
                'explanation_bn' => $q->is_revealed ? $q->explanation_bn : null,
                'submitted_count' => $totalResponses,
                'cohort_accuracy_pct' => $q->is_revealed && $totalResponses > 0
                    ? round(($correctResponses / $totalResponses) * 100, 1)
                    : null,
            ];
        }

        $individualAssistances = $viewer !== null
            ? GroupIndividualAssistance::query()
                ->where('group_session_id', $session->id)
                ->where('student_id', $viewer->id)
                ->orderByDesc('id')
                ->get()
                ->all()
            : [];

        return [
            'session' => $session,
            'active_participants_count' => $participants->where('is_kicked', false)->count(),
            'participants' => $participants,
            'raise_hand_queue' => $raiseHandQueue,
            'broadcast_questions' => $broadcastQuestions,
            'individual_assistances' => $individualAssistances,
            'child_safety_policy' => [
                'direct_messages_enabled' => false,
                'pii_scrubber_active' => true,
                'same_class_cohort_enforced' => true,
                'max_cohort_size' => $session->max_participants,
            ],
        ];
    }
}
