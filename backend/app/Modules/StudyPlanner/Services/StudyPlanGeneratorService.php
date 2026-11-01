<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Services;

use App\Modules\AI\Services\AIOrchestrator;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\ObjectivePrerequisite;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class StudyPlanGeneratorService
{
    public function __construct(
        private readonly AIOrchestrator $aiOrchestrator,
    ) {}

    /**
     * Generates a personalized StudyPlan and daily StudyPlanItems from selected chapters,
     * prerequisite gaps, mastery records, and daily study time budget.
     *
     * @param  array<int, int>  $chapterIds
     */
    public function generatePlan(
        StudentProfile $student,
        string $title,
        array $chapterIds,
        Carbon $targetCompletionDate,
        int $dailyStudyMinutes = 60,
    ): StudyPlan {
        /** @var Collection<int, Chapter> $chapters */
        $chapters = Chapter::query()
            ->with(['subject.academicClass', 'topics.learningObjectives'])
            ->whereIn('id', $chapterIds)
            ->orderBy('sort_order')
            ->get();

        $firstChapter = $chapters->firstOrFail();
        $curriculumVersionId = $firstChapter->subject->academicClass->curriculum_version_id;

        // Load existing mastery records for this student
        /** @var array<int, MasteryRecord> $masteryByObjective */
        $masteryByObjective = MasteryRecord::query()
            ->where('student_id', $student->id)
            ->where('curriculum_version_id', $curriculumVersionId)
            ->get()
            ->keyBy('learning_objective_id')
            ->all();

        $plannedTasks = [];
        $scheduledPrerequisiteIds = [];

        foreach ($chapters as $chapter) {
            foreach ($chapter->topics as $topic) {
                foreach ($topic->learningObjectives as $objective) {
                    // 1. Check strict prerequisites for any unmastered gap (< 75%)
                    /** @var Collection<int, ObjectivePrerequisite> $prereqLinks */
                    $prereqLinks = ObjectivePrerequisite::query()
                        ->with('prerequisiteObjective.topic.chapter')
                        ->where('learning_objective_id', $objective->id)
                        ->get();

                    foreach ($prereqLinks as $link) {
                        $prereqObj = $link->prerequisiteObjective;
                        if (in_array($prereqObj->id, $scheduledPrerequisiteIds, true)) {
                            continue;
                        }

                        $prereqMastery = $masteryByObjective[$prereqObj->id] ?? null;
                        $prereqScore = $prereqMastery !== null ? (float) $prereqMastery->mastery_score : 0.0;

                        if ($prereqScore < 75.0) {
                            $scheduledPrerequisiteIds[] = $prereqObj->id;
                            $plannedTasks[] = [
                                'subject_id' => $prereqObj->topic->chapter->subject_id,
                                'chapter_id' => $prereqObj->topic->chapter_id,
                                'topic_id' => $prereqObj->topic_id,
                                'learning_objective_id' => $prereqObj->id,
                                'task_type' => 'prerequisite_remedial',
                                'title_bn' => "পূর্বজ্ঞান পুনরালোচনা: {$prereqObj->title_bn}",
                                'planned_minutes' => 25,
                            ];
                        }
                    }

                    // 2. Schedule the objective itself based on current mastery status
                    $objMastery = $masteryByObjective[$objective->id] ?? null;
                    $objScore = $objMastery !== null ? (float) $objMastery->mastery_score : 0.0;
                    $objStatus = $objMastery !== null ? $objMastery->mastery_status : 'unstarted';

                    if ($objStatus === 'mastered' || $objScore >= 90.0) {
                        // Already mastered -> concise spaced revision instead of full concept lesson
                        $plannedTasks[] = [
                            'subject_id' => $chapter->subject_id,
                            'chapter_id' => $chapter->id,
                            'topic_id' => $topic->id,
                            'learning_objective_id' => $objective->id,
                            'task_type' => 'revision',
                            'title_bn' => "সংক্ষিপ্ত পুনরালোচনা: {$objective->title_bn}",
                            'planned_minutes' => 15,
                        ];
                    } elseif ($objStatus === 'struggling' || ($objScore > 0.0 && $objScore < 50.0)) {
                        // Struggling -> concept lesson + dedicated guided practice
                        $plannedTasks[] = [
                            'subject_id' => $chapter->subject_id,
                            'chapter_id' => $chapter->id,
                            'topic_id' => $topic->id,
                            'learning_objective_id' => $objective->id,
                            'task_type' => 'concept_lesson',
                            'title_bn' => "বিশেষ পাঠ: {$objective->title_bn}",
                            'planned_minutes' => 30,
                        ];
                        $plannedTasks[] = [
                            'subject_id' => $chapter->subject_id,
                            'chapter_id' => $chapter->id,
                            'topic_id' => $topic->id,
                            'learning_objective_id' => $objective->id,
                            'task_type' => 'guided_practice',
                            'title_bn' => "অতিরিক্ত অনুশীলন: {$objective->title_bn}",
                            'planned_minutes' => 25,
                        ];
                    } else {
                        // Unstarted or practicing -> standard concept lesson + practice
                        $plannedTasks[] = [
                            'subject_id' => $chapter->subject_id,
                            'chapter_id' => $chapter->id,
                            'topic_id' => $topic->id,
                            'learning_objective_id' => $objective->id,
                            'task_type' => 'concept_lesson',
                            'title_bn' => "পাঠ ও অনুশীলন: {$objective->title_bn}",
                            'planned_minutes' => 30,
                        ];
                    }
                }
            }

            // 3. Append a chapter quiz at the end of each selected chapter
            $plannedTasks[] = [
                'subject_id' => $chapter->subject_id,
                'chapter_id' => $chapter->id,
                'topic_id' => null,
                'learning_objective_id' => null,
                'task_type' => 'chapter_quiz',
                'title_bn' => "অধ্যায়ভিত্তিক মূল্যায়ন কুইজ: {$chapter->title_bn}",
                'planned_minutes' => 30,
            ];
        }

        // Generate encouraging Bangla AI Coach summary via AIOrchestrator (fast tier)
        $aiResult = $this->aiOrchestrator->dispatch(
            aiService: 'study_planner',
            systemPrompt: 'Generate an encouraging Bangla study plan summary for a Bangladeshi student.',
            userPrompt: 'Total tasks: '.count($plannedTasks),
            student: $student,
            modelTier: 'fast',
            structuredContext: ['total_tasks' => count($plannedTasks)]
        );

        $coachMessageBn = is_string($aiResult->structuredPayload['coach_message_bn'] ?? null)
            ? $aiResult->structuredPayload['coach_message_bn']
            : 'তোমার নির্বাচিত অধ্যায় ও পূর্বজ্ঞান বিশ্লেষণ করে প্রতিদিনের রুটিন সাজানো হয়েছে।';

        /** @var StudyPlan $createdPlan */
        $createdPlan = DB::transaction(function () use (
            $student,
            $curriculumVersionId,
            $title,
            $chapterIds,
            $targetCompletionDate,
            $dailyStudyMinutes,
            $plannedTasks,
            $coachMessageBn
        ): StudyPlan {
            // Archive any previous active plans for this student
            StudyPlan::query()
                ->where('student_id', $student->id)
                ->where('status', 'active')
                ->update(['status' => 'archived']);

            $plan = StudyPlan::query()->create([
                'student_id' => $student->id,
                'curriculum_version_id' => $curriculumVersionId,
                'title' => $title,
                'target_completion_date' => $targetCompletionDate->toDateString(),
                'daily_study_minutes' => $dailyStudyMinutes,
                'status' => 'active',
                'completion_percentage' => '0.00',
                'config_json' => [
                    'selected_chapter_ids' => array_values($chapterIds),
                    'coach_message_bn' => $coachMessageBn,
                ],
            ]);

            $cursorDate = Carbon::today();
            $accumulatedDayMinutes = 0;

            foreach ($plannedTasks as $taskData) {
                $taskMinutes = (int) $taskData['planned_minutes'];
                if ($accumulatedDayMinutes > 0 && ($accumulatedDayMinutes + $taskMinutes) > $dailyStudyMinutes) {
                    $cursorDate = $cursorDate->copy()->addDay();
                    $accumulatedDayMinutes = 0;
                }

                StudyPlanItem::query()->create([
                    'study_plan_id' => $plan->id,
                    'student_id' => $student->id,
                    'subject_id' => $taskData['subject_id'],
                    'chapter_id' => $taskData['chapter_id'],
                    'topic_id' => $taskData['topic_id'],
                    'learning_objective_id' => $taskData['learning_objective_id'],
                    'task_type' => $taskData['task_type'],
                    'title_bn' => $taskData['title_bn'],
                    'scheduled_date' => $cursorDate->toDateString(),
                    'planned_minutes' => $taskMinutes,
                    'actual_active_minutes' => 0,
                    'status' => 'scheduled',
                ]);

                $accumulatedDayMinutes += $taskMinutes;
            }

            return $plan;
        });

        return $createdPlan->load('items');
    }

    /**
     * Adaptive rescheduler: detects missed (`scheduled_date < today`) items and injects
     * remedial practice for struggling objectives, distributing them across upcoming days.
     */
    public function rebalanceAndReschedule(StudyPlan $plan): StudyPlan
    {
        $today = Carbon::today();
        $maxDailyCap = max(30, (int) round($plan->daily_study_minutes * 1.25));

        DB::transaction(function () use ($plan, $today, $maxDailyCap): void {
            /** @var Collection<int, StudyPlanItem> $missedItems */
            $missedItems = StudyPlanItem::query()
                ->where('study_plan_id', $plan->id)
                ->whereIn('status', ['scheduled', 'overdue'])
                ->whereDate('scheduled_date', '<', $today->toDateString())
                ->orderBy('scheduled_date')
                ->orderBy('id')
                ->get();

            $cursorDate = $today->copy();

            foreach ($missedItems as $item) {
                while (true) {
                    $existingMinutesOnDate = (int) StudyPlanItem::query()
                        ->where('study_plan_id', $plan->id)
                        ->whereDate('scheduled_date', $cursorDate->toDateString())
                        ->whereNotIn('status', ['completed'])
                        ->sum('planned_minutes');

                    if ($existingMinutesOnDate === 0 || ($existingMinutesOnDate + $item->planned_minutes) <= $maxDailyCap) {
                        break;
                    }

                    $cursorDate = $cursorDate->copy()->addDay();
                }

                $item->update([
                    'rescheduled_from_date' => $item->rescheduled_from_date ?? $item->scheduled_date->toDateString(),
                    'scheduled_date' => $cursorDate->toDateString(),
                    'status' => 'rescheduled',
                ]);
            }

            // Inject remedial practice if student has struggling MasteryRecords not yet remediated
            /** @var Collection<int, MasteryRecord> $strugglingRecords */
            $strugglingRecords = MasteryRecord::query()
                ->with('learningObjective.topic.chapter')
                ->where('student_id', $plan->student_id)
                ->where('curriculum_version_id', $plan->curriculum_version_id)
                ->where('mastery_status', 'struggling')
                ->get();

            foreach ($strugglingRecords as $record) {
                $obj = $record->learningObjective;
                $alreadyScheduledRemedial = StudyPlanItem::query()
                    ->where('study_plan_id', $plan->id)
                    ->where('learning_objective_id', $obj->id)
                    ->where('task_type', 'guided_practice')
                    ->whereIn('status', ['scheduled', 'rescheduled'])
                    ->exists();

                if (! $alreadyScheduledRemedial) {
                    StudyPlanItem::query()->create([
                        'study_plan_id' => $plan->id,
                        'student_id' => $plan->student_id,
                        'subject_id' => $obj->topic->chapter->subject_id,
                        'chapter_id' => $obj->topic->chapter_id,
                        'topic_id' => $obj->topic_id,
                        'learning_objective_id' => $obj->id,
                        'task_type' => 'guided_practice',
                        'title_bn' => "পুনঃঅনুশীলন (Remedial): {$obj->title_bn}",
                        'scheduled_date' => $today->toDateString(),
                        'planned_minutes' => 25,
                        'actual_active_minutes' => 0,
                        'status' => 'scheduled',
                    ]);
                }
            }

            $this->recalculateCompletionPercentage($plan);
        });

        return $plan->fresh('items') ?? $plan;
    }

    public function recalculateCompletionPercentage(StudyPlan $plan): void
    {
        $total = StudyPlanItem::query()->where('study_plan_id', $plan->id)->count();
        if ($total === 0) {
            return;
        }

        $completed = StudyPlanItem::query()
            ->where('study_plan_id', $plan->id)
            ->where('status', 'completed')
            ->count();

        $pct = round(($completed / $total) * 100.0, 2);
        $plan->update([
            'completion_percentage' => number_format($pct, 2, '.', ''),
            'status' => $completed === $total ? 'completed' : $plan->status,
        ]);
    }
}
