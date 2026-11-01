<?php

declare(strict_types=1);

namespace App\Modules\LearningAnalytics\Services;

use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Tutoring\Models\TutorMessage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

final class LearningAnalyticsService
{
    /**
     * Computes the 5-Tier Student Performance Analytics report:
     * 1. Overall Academic Snapshot
     * 2. Subject-Wise Mastery Matrix
     * 3. Topic & Objective Weakness Radar
     * 4. Actionable Bangla Mentorship Recommendations
     * 5. Week-over-Week Study & Assessment Trends
     *
     * @return array<string, mixed>
     */
    public function buildFiveTierAnalytics(StudentProfile $student): array
    {
        $student->loadMissing('user');

        /** @var Collection<int, MasteryRecord> $masteryRecords */
        $masteryRecords = MasteryRecord::query()
            ->with('learningObjective.topic.chapter.subject')
            ->where('student_id', $student->id)
            ->get();

        /** @var Collection<int, ExamAttempt> $examAttempts */
        $examAttempts = ExamAttempt::query()
            ->with('exam.subject')
            ->where('student_id', $student->id)
            ->whereIn('status', ['provisional_graded', 'final_graded'])
            ->orderByDesc('submitted_at')
            ->get();

        $sevenDaysAgo = Carbon::today()->subDays(6)->toDateString();
        $todayStr = Carbon::today()->toDateString();

        /** @var Collection<int, StudyTimeLog> $recentTimeLogs */
        $recentTimeLogs = StudyTimeLog::query()
            ->where('student_id', $student->id)
            ->whereDate('study_date', '>=', $sevenDaysAgo)
            ->whereDate('study_date', '<=', $todayStr)
            ->get();

        // Tier 1: Overall Academic Snapshot
        $overallMasteryPct = $masteryRecords->isNotEmpty()
            ? round((float) $masteryRecords->avg(fn (MasteryRecord $r): float => (float) $r->mastery_score), 2)
            : 0.0;

        $proficientOrMasteredCount = $masteryRecords
            ->filter(fn (MasteryRecord $r): bool => in_array($r->mastery_status, ['proficient', 'mastered'], true))
            ->count();

        $activeSecondsLast7Days = (int) $recentTimeLogs->sum('active_seconds');
        $activeMinutesLast7Days = (int) round($activeSecondsLast7Days / 60);

        $avgExamPct = $examAttempts->isNotEmpty()
            ? round((float) $examAttempts->avg(fn (ExamAttempt $a): float => (float) $a->percentage_score), 2)
            : 0.0;

        $tier1Snapshot = [
            'overall_mastery_percentage' => $overallMasteryPct,
            'active_study_minutes_last_7_days' => $activeMinutesLast7Days,
            'daily_study_target_mins' => $student->daily_study_target_mins,
            'exams_completed_count' => $examAttempts->count(),
            'average_exam_score_percentage' => $avgExamPct,
            'objectives_tracked_count' => $masteryRecords->count(),
            'objectives_proficient_or_mastered_count' => $proficientOrMasteredCount,
        ];

        // Tier 2: Subject-Wise Mastery Matrix
        $subjectGroups = $masteryRecords->groupBy(
            fn (MasteryRecord $r): int => $r->learningObjective->topic->chapter->subject_id
        );

        $tier2SubjectMatrix = [];
        foreach ($subjectGroups as $subjectId => $records) {
            /** @var MasteryRecord $firstRec */
            $firstRec = $records->first();
            $subject = $firstRec->learningObjective->topic->chapter->subject;
            $avgSubjMastery = round(
                (float) $records->avg(fn (MasteryRecord $r): float => (float) $r->mastery_score),
                2
            );
            $chaptersCount = $records
                ->map(fn (MasteryRecord $r): int => $r->learningObjective->topic->chapter_id)
                ->unique()
                ->count();
            $subjExamsCount = $examAttempts
                ->filter(fn (ExamAttempt $a): bool => $a->exam->subject_id === (int) $subjectId)
                ->count();

            $tier2SubjectMatrix[] = [
                'subject_id' => (int) $subjectId,
                'title_bn' => $subject->title_bn,
                'title_en' => $subject->title_en,
                'average_mastery_pct' => $avgSubjMastery,
                'chapters_covered_count' => $chaptersCount,
                'exams_taken_count' => $subjExamsCount,
            ];
        }

        // Tier 3: Topic & Learning Objective Weakness Detector
        /** @var array<int, string> $recentMisconceptions */
        $recentMisconceptions = TutorMessage::query()
            ->whereHas('session', fn ($q) => $q->where('student_id', $student->id))
            ->whereNotNull('misconception_code')
            ->latest('id')
            ->limit(5)
            ->pluck('misconception_code')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $weakRecords = $masteryRecords
            ->filter(fn (MasteryRecord $r): bool => ((float) $r->mastery_score) < 75.0)
            ->sortBy(fn (MasteryRecord $r): float => (float) $r->mastery_score)
            ->values();

        $tier3Weaknesses = [];
        foreach ($weakRecords as $weak) {
            $obj = $weak->learningObjective;
            $chapter = $obj->topic->chapter;
            $tier3Weaknesses[] = [
                'learning_objective_id' => $obj->id,
                'objective_code' => $obj->code,
                'title_bn' => $obj->title_bn,
                'chapter_title_bn' => $chapter->title_bn,
                'mastery_score' => (float) $weak->mastery_score,
                'mastery_status' => $weak->mastery_status,
                'recent_misconceptions' => $recentMisconceptions,
            ];
        }

        // Tier 4: Actionable Bangla Mentorship Recommendations
        $tier4Recommendations = [];
        foreach (array_slice($tier3Weaknesses, 0, 3) as $weakItem) {
            $scoreFormatted = (int) round((float) $weakItem['mastery_score']);
            $tier4Recommendations[] = [
                'priority' => $scoreFormatted < 50 ? 'high' : 'medium',
                'objective_code' => $weakItem['objective_code'],
                'recommendation_bn' => "'{$weakItem['title_bn']}' ({$weakItem['chapter_title_bn']}) টপিকে তোমার বর্তমান দক্ষতা {$scoreFormatted}%। আগামীকাল ২৫ মিনিট পূর্বজ্ঞান পুনরালোচনা ও এআই গৃহশিক্ষকের সাথে অনুশীলনের পরামর্শ দেওয়া হলো।",
            ];
        }

        if ($tier4Recommendations === []) {
            $tier4Recommendations[] = [
                'priority' => 'normal',
                'objective_code' => null,
                'recommendation_bn' => 'অভিনন্দন! তোমার বর্তমান অধ্যায়গুলোর দক্ষতা সন্তোষজনক। নিয়মিত অধ্যায়ভিত্তিক মডেল পরীক্ষায় অংশ নাও।',
            ];
        }

        // Tier 5: 7-Day Daily Study & Progress Trend
        $tier5DailyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateStr = Carbon::today()->subDays($i)->toDateString();
            $dayLogs = $recentTimeLogs->filter(
                fn (StudyTimeLog $l): bool => $l->study_date->toDateString() === $dateStr
            );
            $dayActiveMins = (int) round(((int) $dayLogs->sum('active_seconds')) / 60);
            $dayQuestions = (int) $dayLogs->sum('questions_attempted');

            $tier5DailyTrend[] = [
                'date' => $dateStr,
                'active_minutes' => $dayActiveMins,
                'questions_attempted' => $dayQuestions,
            ];
        }

        return [
            'student' => [
                'student_code' => $student->student_code,
                'name_bn' => $student->user->name_bn ?? $student->user->name_en,
                'name_en' => $student->user->name_en,
                'current_class_level' => $student->current_class_level,
                'medium' => $student->medium,
            ],
            'tier_1_snapshot' => $tier1Snapshot,
            'tier_2_subject_matrix' => $tier2SubjectMatrix,
            'tier_3_weaknesses' => $tier3Weaknesses,
            'tier_4_recommendations_bn' => $tier4Recommendations,
            'tier_5_weekly_trend' => $tier5DailyTrend,
            'recent_exams' => $examAttempts->take(5)->map(fn (ExamAttempt $a): array => [
                'attempt_id' => $a->id,
                'title_bn' => $a->exam->title_bn,
                'obtained_marks' => (float) $a->obtained_marks,
                'total_marks' => (float) $a->exam->total_marks,
                'percentage_score' => (float) $a->percentage_score,
                'status' => $a->status,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
            ])->values()->all(),
        ];
    }

    /**
     * Generates a downloadable PDF Weekly Parent Report Card for a student.
     */
    public function generateWeeklyReportPdf(StudentProfile $student): string
    {
        $analytics = $this->buildFiveTierAnalytics($student);
        /** @var array<string, mixed> $snapshot */
        $snapshot = $analytics['tier_1_snapshot'];

        $streamText = implode(' | ', [
            'AI Home Tutor Bangladesh - Weekly Parent Report',
            "Student Code: {$student->student_code}",
            "Class: {$student->current_class_level}",
            "Mastery: {$snapshot['overall_mastery_percentage']}%",
            "Active Study (7d): {$snapshot['active_study_minutes_last_7_days']} mins",
        ]);

        $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $streamText);
        $stream = "BT /F1 12 Tf 50 750 Td ({$escaped}) Tj ET";
        $len = strlen($stream);

        return implode("\n", [
            '%PDF-1.4',
            '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
            "4 0 obj << /Length {$len} >> stream",
            $stream,
            'endstream endobj',
            '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
            'trailer << /Root 1 0 R >>',
            '%%EOF',
        ]);
    }
}
