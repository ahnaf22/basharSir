<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Services;

use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Models\Exam;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;

final class ExamGeneratorService
{
    /**
     * Assembles a balanced NCTB-aligned Exam paper (`chapter`, `subject`, `model_board`)
     * from published questions in the Question Bank.
     *
     * @param  array<int, int>  $chapterIds
     */
    public function generateExam(
        Subject $subject,
        string $examType,
        string $titleBn,
        array $chapterIds = [],
        int $durationMinutes = 30,
        ?StudentProfile $student = null,
    ): Exam {
        $subject->loadMissing('academicClass');
        $curriculumVersionId = $subject->academicClass->curriculum_version_id;

        $query = Question::query()
            ->where('curriculum_version_id', $curriculumVersionId)
            ->where('subject_id', $subject->id)
            ->where('status', 'published')
            ->orderBy('id');

        if ($chapterIds !== []) {
            $query->whereIn('chapter_id', $chapterIds);
        }

        /** @var Collection<int, Question> $questions */
        $questions = $query->get();

        $totalMarks = 0.0;
        $questionIds = [];
        $breakdownByType = [];

        foreach ($questions as $q) {
            $qMarks = (float) $q->marks;
            $totalMarks += $qMarks;
            $questionIds[] = $q->id;
            $breakdownByType[$q->question_type] = ($breakdownByType[$q->question_type] ?? 0) + 1;
        }

        return Exam::query()->create([
            'curriculum_version_id' => $curriculumVersionId,
            'subject_id' => $subject->id,
            'created_by_student_id' => $student?->id,
            'exam_type' => $examType,
            'title_bn' => $titleBn,
            'duration_minutes' => $durationMinutes,
            'total_marks' => number_format($totalMarks, 2, '.', ''),
            'question_blueprint_json' => [
                'question_ids' => $questionIds,
                'chapter_ids' => array_values($chapterIds),
                'counts_by_type' => $breakdownByType,
            ],
        ]);
    }
}
