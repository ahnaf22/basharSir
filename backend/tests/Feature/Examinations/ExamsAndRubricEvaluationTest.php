<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Models\ExamAttempt;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\QuestionBank\Models\Question;
use App\Modules\Students\Models\StudentProfile;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbQuestionBankSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('generates an NCTB exam blueprint, enforces server timer with 60s grace window, grades objective and rubric questions, and updates mastery idempotently', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbQuestionBankSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'সাদিয়া আফরিন',
        'name_en' => 'Sadia Afrin',
        'phone' => '+8801733445566',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-600101',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $token = $user->createToken('exam-test')->plainTextToken;

    $qMcqSingle = Question::query()->where('question_type', 'mcq_single')->firstOrFail();
    $qMcqMulti = Question::query()->where('question_type', 'mcq_multi_statement')->firstOrFail();
    $qFillBlank = Question::query()->where('question_type', 'fill_blank')->firstOrFail();
    $qMath = Question::query()->where('question_type', 'math_problem')->firstOrFail();
    $qCreative = Question::query()->where('question_type', 'creative_srijonshil')->firstOrFail();

    $subject = Subject::query()->findOrFail($qMcqSingle->subject_id);
    $chapter = Chapter::query()->findOrFail($qMcqSingle->chapter_id);

    // 1. Generate and start a chapter exam
    $genRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/exams/generate', [
            'subject_id' => $subject->id,
            'exam_type' => 'chapter',
            'title_bn' => 'অষ্টম শ্রেণি গণিত চতুর্থ অধ্যায় মডেল পরীক্ষা',
            'chapter_ids' => [$chapter->id],
            'duration_minutes' => 30,
        ])
        ->assertCreated();

    $attemptId = (int) $genRes->json('data.id');
    expect($genRes->json('data.total_marks'))->toEqual(17.0)
        ->and($genRes->json('data.questions'))->toHaveCount(5);

    // 2. Autosave answers (including Bangla numerals '১৩' for fill-in-the-blank and partial step answer for math_problem)
    $this->withHeader('Authorization', "Bearer {$token}")
        ->putJson("/api/v1/exam-attempts/{$attemptId}/answers", [
            'answers' => [
                [
                    'question_id' => $qMcqSingle->id,
                    'answer_mode' => 'mcq_choice',
                    'selected_option_key' => 'B',
                    'time_spent_seconds' => 20,
                ],
                [
                    'question_id' => $qMcqMulti->id,
                    'answer_mode' => 'mcq_choice',
                    'selected_option_key' => 'D',
                    'time_spent_seconds' => 35,
                ],
                [
                    'question_id' => $qFillBlank->id,
                    'answer_mode' => 'typed_text',
                    'typed_answer_text' => '১৩',
                    'time_spent_seconds' => 25,
                ],
                [
                    'question_id' => $qMath->id,
                    'answer_mode' => 'typed_text',
                    'typed_answer_text' => 'দেওয়া আছে a+b=7, ab=12। আমরা জানি (a-b)^2 = (a+b)^2 - 4ab = 49-48 = 1',
                    'time_spent_seconds' => 95,
                ],
                [
                    'question_id' => $qCreative->id,
                    'answer_mode' => 'typed_text',
                    'typed_answer_text' => 'ক) x^2+2+1/x^2 খ) १४ = 14 গ) ১৯৪ ঘ) ১২',
                    'time_spent_seconds' => 180,
                ],
            ],
        ])
        ->assertOk();

    // 3. Submit attempt (high confidence >= 0.80 -> provisional_graded)
    $submitRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/exam-attempts/{$attemptId}/submit")
        ->assertOk();

    expect($submitRes->json('data.status'))->toBe('provisional_graded')
        ->and($submitRes->json('data.obtained_marks'))->toEqual(17.0)
        ->and($submitRes->json('data.percentage_score'))->toEqual(100.0)
        ->and($submitRes->json('meta.idempotent_replay'))->toBeFalse();

    // 4. Duplicate submit is idempotent
    $replayRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/exam-attempts/{$attemptId}/submit")
        ->assertOk();
    expect($replayRes->json('meta.idempotent_replay'))->toBeTrue();

    // 5. Verify MasteryRecord was updated from verified chapter_exam evidence
    $mastery = MasteryRecord::query()
        ->where('student_id', $student->id)
        ->where('learning_objective_id', $qMcqSingle->learning_objective_id)
        ->first();

    expect($mastery)->not->toBeNull()
        ->and((float) $mastery?->mastery_score)->toBeGreaterThanOrEqual(75.0)
        ->and($mastery?->mastery_status)->toBeIn(['proficient', 'mastered']);
});

it('rejects answer autosave past the 60-second grace window and routes low-confidence rubric evaluations to flagged_for_human', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbQuestionBankSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'ইমরান হোসেন',
        'name_en' => 'Imran Hossain',
        'phone' => '+8801744556677',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-600202',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $token = $user->createToken('timer-test')->plainTextToken;
    $qMath = Question::query()->where('question_type', 'math_problem')->firstOrFail();

    $genRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/exams/generate', [
            'subject_id' => $qMath->subject_id,
            'exam_type' => 'chapter',
            'title_bn' => 'টাইমার ও রুব্রিক কনফিডেন্স পরীক্ষা',
            'chapter_ids' => [$qMath->chapter_id],
            'duration_minutes' => 15,
        ])
        ->assertCreated();

    $attemptId = (int) $genRes->json('data.id');

    // Submit with simulated low confidence (0.65 < 0.80 threshold) -> flagged_for_human
    $lowConfRes = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson("/api/v1/exam-attempts/{$attemptId}/submit", [
            'simulated_rubric_confidence' => 0.65,
        ])
        ->assertOk();

    /** @var array<int, array<string, mixed>> $submittedAnswers */
    $submittedAnswers = $lowConfRes->json('data.submitted_answers');
    $mathSubmitted = collect($submittedAnswers)->firstWhere('question_id', $qMath->id);

    expect($mathSubmitted)->not->toBeNull()
        ->and($mathSubmitted['evaluation']['review_status'])->toBe('flagged_for_human')
        ->and($mathSubmitted['evaluation']['confidence_score'])->toEqual(0.65);

    // Start a second attempt, expire its timer by 90 seconds (> 60s grace window), and verify autosave is blocked
    $genRes2 = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/exams/generate', [
            'subject_id' => $qMath->subject_id,
            'exam_type' => 'chapter',
            'title_bn' => 'সময় উত্তীর্ণ পরীক্ষা',
            'chapter_ids' => [$qMath->chapter_id],
            'duration_minutes' => 15,
        ])
        ->assertCreated();

    $attemptId2 = (int) $genRes2->json('data.id');
    ExamAttempt::query()->where('id', $attemptId2)->update([
        'expires_at' => now()->subSeconds(90),
    ]);

    $this->withHeader('Authorization', "Bearer {$token}")
        ->putJson("/api/v1/exam-attempts/{$attemptId2}/answers", [
            'answers' => [
                [
                    'question_id' => $qMath->id,
                    'answer_mode' => 'typed_text',
                    'typed_answer_text' => 'a+b=7',
                ],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonPath('error.code', 'EXAM_TIMER_EXPIRED');
});
