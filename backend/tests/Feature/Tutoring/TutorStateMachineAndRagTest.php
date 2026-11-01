<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Tutoring\Enums\TutorLessonStage;
use App\Modules\Tutoring\Models\TutorMessage;
use App\Modules\Tutoring\Models\TutorSession;
use App\Modules\Tutoring\Services\AcademicRagRetriever;
use App\Modules\Tutoring\Services\TutorResponseValidator;
use App\Modules\Tutoring\Services\TutorStateMachine;
use Database\Seeders\NctbCurriculumSeeder;
use Database\Seeders\NctbLearningResourceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('traverses all 13 pedagogical stages and enforces backend invariants on MINI_ASSESSMENT and COMPLETED', function (): void {
    $sm = new TutorStateMachine;
    $meta = $sm->initialMetadata();

    // 1. START_LESSON -> CHECK_PREREQUISITES
    $res = $sm->resolveNextStage(TutorLessonStage::START_LESSON, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::CHECK_PREREQUISITES);
    $meta = $res->updatedMetadata;

    // 2. CHECK_PREREQUISITES (wrong answer) -> TEACH_PREREQUISITE
    $res = $sm->resolveNextStage(TutorLessonStage::CHECK_PREREQUISITES, 'text_reply', false, 'PREREQ_COEFF_ERROR', $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::TEACH_PREREQUISITE)
        ->and($res->updatedMetadata['prerequisite_passed'])->toBeFalse();
    $meta = $res->updatedMetadata;

    // 3. TEACH_PREREQUISITE -> EXPLAIN_CONCEPT
    $res = $sm->resolveNextStage(TutorLessonStage::TEACH_PREREQUISITE, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::EXPLAIN_CONCEPT);
    $meta = $res->updatedMetadata;

    // 4. EXPLAIN_CONCEPT -> WORKED_EXAMPLE
    $res = $sm->resolveNextStage(TutorLessonStage::EXPLAIN_CONCEPT, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::WORKED_EXAMPLE);
    $meta = $res->updatedMetadata;

    // 5. WORKED_EXAMPLE -> ASK_STUDENT_QUESTION
    $res = $sm->resolveNextStage(TutorLessonStage::WORKED_EXAMPLE, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::ASK_STUDENT_QUESTION);
    $meta = $res->updatedMetadata;

    // 6. Premature LLM proposal to jump to MINI_ASSESSMENT when consecutive_correct_guided < 2 is BLOCKED
    $blockedJump = $sm->resolveNextStage(
        TutorLessonStage::ASK_STUDENT_QUESTION,
        'text_reply',
        null,
        null,
        $meta,
        TutorLessonStage::MINI_ASSESSMENT
    );
    expect($blockedJump->wasBlockedByInvariant)->toBeTrue()
        ->and($blockedJump->nextStage)->toBe(TutorLessonStage::ASK_STUDENT_QUESTION)
        ->and($blockedJump->invariantReason)->toBe('REQUIRES_AT_LEAST_2_CONSECUTIVE_CORRECT_GUIDED_ANSWERS');

    // 7. ASK_STUDENT_QUESTION (wrong answer) -> IDENTIFY_MISCONCEPTION
    $res = $sm->resolveNextStage(TutorLessonStage::ASK_STUDENT_QUESTION, 'text_reply', false, 'ALG_EXPONENT_ADDITION', $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::IDENTIFY_MISCONCEPTION)
        ->and($res->updatedMetadata['misconceptions_logged'])->toContain('ALG_EXPONENT_ADDITION');
    $meta = $res->updatedMetadata;

    // 8. IDENTIFY_MISCONCEPTION -> EXPLAIN_CORRECTION
    $res = $sm->resolveNextStage(TutorLessonStage::IDENTIFY_MISCONCEPTION, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::EXPLAIN_CORRECTION);
    $meta = $res->updatedMetadata;

    // 9. EXPLAIN_CORRECTION -> ASK_SIMILAR_QUESTION
    $res = $sm->resolveNextStage(TutorLessonStage::EXPLAIN_CORRECTION, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::ASK_SIMILAR_QUESTION);
    $meta = $res->updatedMetadata;

    // 10. ASK_SIMILAR_QUESTION (1st correct) -> ASK_SIMILAR_QUESTION, (2nd correct) -> INCREASE_DIFFICULTY
    $res = $sm->resolveNextStage(TutorLessonStage::ASK_SIMILAR_QUESTION, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::ASK_SIMILAR_QUESTION)
        ->and($res->updatedMetadata['consecutive_correct_guided'])->toBe(1);
    $meta = $res->updatedMetadata;

    $res = $sm->resolveNextStage(TutorLessonStage::ASK_SIMILAR_QUESTION, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::INCREASE_DIFFICULTY)
        ->and($res->updatedMetadata['consecutive_correct_guided'])->toBe(2);
    $meta = $res->updatedMetadata;

    // 11. INCREASE_DIFFICULTY (correct) -> MINI_ASSESSMENT
    $res = $sm->resolveNextStage(TutorLessonStage::INCREASE_DIFFICULTY, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::MINI_ASSESSMENT);
    $meta = $res->updatedMetadata;

    // 12. Hints during MINI_ASSESSMENT are blocked
    $hintBlocked = $sm->resolveNextStage(TutorLessonStage::MINI_ASSESSMENT, 'hint', null, null, $meta);
    expect($hintBlocked->wasBlockedByInvariant)->toBeTrue()
        ->and($hintBlocked->invariantReason)->toBe('HINTS_DISABLED_DURING_MINI_ASSESSMENT');

    // 13. Premature completion before 3 mini-assessment items is blocked
    $res = $sm->resolveNextStage(TutorLessonStage::MINI_ASSESSMENT, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::MINI_ASSESSMENT)
        ->and($res->updatedMetadata['mini_assessment_attempted'])->toBe(1);
    $meta = $res->updatedMetadata;

    $res = $sm->resolveNextStage(TutorLessonStage::MINI_ASSESSMENT, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::MINI_ASSESSMENT)
        ->and($res->updatedMetadata['mini_assessment_attempted'])->toBe(2);
    $meta = $res->updatedMetadata;

    // 3rd correct mini-assessment item (3/3 = 100% >= 75%) -> SAVE_LEARNING_PROGRESS
    $res = $sm->resolveNextStage(TutorLessonStage::MINI_ASSESSMENT, 'text_reply', true, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::SAVE_LEARNING_PROGRESS)
        ->and($res->wasBlockedByInvariant)->toBeFalse();
    $meta = $res->updatedMetadata;

    // 14. SAVE_LEARNING_PROGRESS -> COMPLETED
    $res = $sm->resolveNextStage(TutorLessonStage::SAVE_LEARNING_PROGRESS, 'text_reply', null, null, $meta);
    expect($res->nextStage)->toBe(TutorLessonStage::COMPLETED);
});

it('builds RAG context under 3500 tokens and validates TutorResponseSchema', function (): void {
    $this->seed(NctbCurriculumSeeder::class);
    $this->seed(NctbLearningResourceSeeder::class);

    $user = User::query()->create([
        'name_bn' => 'নাদিয়া সুলতানা',
        'name_en' => 'Nadia Sultana',
        'phone' => '+8801711223344',
        'account_type' => 'student',
        'status' => 'active',
    ]);

    $student = StudentProfile::query()->create([
        'user_id' => $user->id,
        'student_code' => 'STD-2026-200301',
        'current_class_level' => 8,
        'medium' => 'bangla',
        'consent_status' => 'verified',
    ]);

    $objective = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->firstOrFail();

    $session = TutorSession::query()->create([
        'student_id' => $student->id,
        'curriculum_version_id' => $objective->topic->chapter->subject->academicClass->curriculum_version_id,
        'topic_id' => $objective->topic_id,
        'active_objective_id' => $objective->id,
        'current_stage' => TutorLessonStage::EXPLAIN_CONCEPT->value,
        'session_status' => 'active',
        'compact_summary_text' => 'শিক্ষার্থী চলক ও সহগের যোগ বুঝতে পেরেছে।',
        'state_metadata_json' => (new TutorStateMachine)->initialMetadata(),
        'started_at' => now(),
    ]);

    for ($i = 1; $i <= 6; $i++) {
        TutorMessage::query()->create([
            'tutor_session_id' => $session->id,
            'client_turn_id' => (string) Str::uuid(),
            'sender_role' => $i % 2 === 0 ? 'tutor' : 'student',
            'lesson_stage' => TutorLessonStage::EXPLAIN_CONCEPT->value,
            'student_action_type' => 'text_reply',
            'student_input_text' => "Turn message {$i}",
        ]);
    }

    /** @var AcademicRagRetriever $retriever */
    $retriever = app(AcademicRagRetriever::class);
    $ragContext = $retriever->buildContext($session, 'EXPLAIN_CONCEPT', 'simplify', 'আরেকটু সহজ করে বোঝাও');

    expect($ragContext->estimatedInputTokens)->toBeLessThan(AcademicRagRetriever::MAX_INPUT_TOKEN_BUDGET)
        ->and($ragContext->ragChunkTexts)->not->toBeEmpty()
        ->and($ragContext->userPrompt)->toContain('Turn message 6')
        ->and($ragContext->userPrompt)->not->toContain('Turn message 1');

    $validator = new TutorResponseValidator;
    $validated = $validator->validateAndNormalize(
        [
            'explanation_bn' => 'দুইটি পদের যোগফলের বর্গ $(a + b)^2 = a^2 + 2ab + b^2$।',
            'worked_step_latex' => '(a+b)^2 = a^2 + 2ab + b^2',
            'interactive_question' => [
                'question_text_bn' => '$(x + 2)^2 =$ কত?',
                'question_type' => 'short_answer',
                'difficulty' => 'easy',
                'expected_answer_canonical' => 'x^2+4x+4',
                'accepted_equivalents' => ['x^2+4x+4'],
            ],
            'hints' => [
                ['level' => 1, 'text_bn' => 'প্রথম পদ $x$ এবং দ্বিতীয় পদ $2$ ধরো।'],
            ],
        ],
        TutorLessonStage::EXPLAIN_CONCEPT,
        $objective->code,
        $ragContext->nctbReference
    );

    expect($validated['lesson_stage'])->toBe('EXPLAIN_CONCEPT')
        ->and($validated['pedagogical_step'])->toBe(3)
        ->and($validated['allow_hint'])->toBeTrue();
});
