<?php

declare(strict_types=1);

namespace App\Modules\AI\Providers;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\DTOs\AiProviderRequestData;
use App\Modules\AI\DTOs\AiProviderResponseData;

final class DeterministicCurriculumAiProvider implements AiProviderInterface
{
    public function providerName(): string
    {
        return 'deterministic_curriculum';
    }

    public function generateStructured(AiProviderRequestData $request): AiProviderResponseData
    {
        $startTime = microtime(true);

        $inputTokens = max(60, (int) ceil((mb_strlen($request->systemPrompt) + mb_strlen($request->userPrompt)) / 3.8));
        $payload = match ($request->aiService) {
            'tutor_engine' => $this->buildTutorPayload($request->structuredContext),
            'study_planner' => $this->buildStudyPlannerPayload($request->structuredContext),
            'answer_evaluator' => $this->buildAnswerEvaluatorPayload($request->structuredContext),
            default => [
                'status' => 'ok',
                'summary_bn' => 'এনসিটিবি পাঠ্যক্রম অনুযায়ী ফলাফল প্রস্তুত করা হয়েছে।',
            ],
        };

        $serializedOutput = (string) json_encode($payload, JSON_UNESCAPED_UNICODE);
        $outputTokens = max(45, (int) ceil(mb_strlen($serializedOutput) / 3.8));

        // Frontier tier cost simulation: $1.25 / 1M input, $5.00 / 1M output
        $inputRatePerMillion = $request->modelTier === 'fast' ? 0.15 : 1.25;
        $outputRatePerMillion = $request->modelTier === 'fast' ? 0.60 : 5.00;
        $estimatedCostUsd = round(
            (($inputTokens / 1_000_000) * $inputRatePerMillion) + (($outputTokens / 1_000_000) * $outputRatePerMillion),
            6
        );

        $latencyMs = max(12, (int) round((microtime(true) - $startTime) * 1000));
        $modelName = $request->modelTier === 'fast'
            ? 'nctb-curriculum-fast-v1'
            : 'nctb-curriculum-reasoner-v1';

        return new AiProviderResponseData(
            providerName: $this->providerName(),
            modelName: $modelName,
            structuredPayload: $payload,
            inputTokens: $inputTokens,
            outputTokens: $outputTokens,
            estimatedCostUsd: $estimatedCostUsd,
            latencyMs: $latencyMs,
        );
    }

    /**
     * @param  array<string, mixed>  $ctx
     * @return array<string, mixed>
     */
    private function buildTutorPayload(array $ctx): array
    {
        $lessonStage = is_string($ctx['target_stage'] ?? null) ? $ctx['target_stage'] : 'START_LESSON';
        $objectiveCode = is_string($ctx['objective_code'] ?? null) ? $ctx['objective_code'] : 'C8-MATH-CH4-T1-LO1';
        $objectiveTitleBn = is_string($ctx['objective_title_bn'] ?? null)
            ? $ctx['objective_title_bn']
            : 'দ্বিপদী ও ত্রিপদী রাশির বর্গ নির্ণয়';
        $nctbRef = is_string($ctx['nctb_reference'] ?? null)
            ? $ctx['nctb_reference']
            : 'অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়, পৃষ্ঠা ৪৭–৫২';
        $ragExcerpt = is_string($ctx['primary_rag_excerpt'] ?? null)
            ? $ctx['primary_rag_excerpt']
            : 'দুইটি পদের যোগফলের বর্গ $(a + b)^2 = a^2 + 2ab + b^2$।';
        $wasAnswered = (bool) ($ctx['was_answered'] ?? false);
        $isCorrect = (bool) ($ctx['is_correct'] ?? false);
        $misconceptionCode = is_string($ctx['misconception_code'] ?? null) ? $ctx['misconception_code'] : null;
        $studentAction = is_string($ctx['student_action_type'] ?? null) ? $ctx['student_action_type'] : 'text_reply';
        $suggestedNextStage = is_string($ctx['suggested_next_stage'] ?? null)
            ? $ctx['suggested_next_stage']
            : $this->defaultSuggestedNextStage($lessonStage);

        $explanationBn = match ($lessonStage) {
            'START_LESSON' => 'স্বাগতম! আজ আমরা শিখব: '.$objectiveTitleBn.'। এই পাঠ শেষে তুমি এনসিটিবি পাঠ্যবইয়ের নিয়ম মেনে নিজে নিজে গাণিতিক সমস্যা সমাধান করতে পারবে। চলো শুরুতে একটি সহজ পূর্বজ্ঞান যাচাই করে নিই।',
            'CHECK_PREREQUISITES' => 'মূল পাঠে যাওয়ার আগে চলো যাচাই করি তোমার চলক ও সহগের ধারণাটি পরিষ্কার আছে কি না।',
            'TEACH_PREREQUISITE' => 'চিন্তার কিছু নেই! মূল সূত্রে যাওয়ার আগে আমরা সদৃশ পদগুলোর যোগ করার নিয়মটি সহজভাবে ঝালাই করে নিই: $3x + 2x = (3 + 2)x = 5x$। এখানে চলক $x$-এর ঘাত পরিবর্তন হয় না।',
            'EXPLAIN_CONCEPT' => $studentAction === 'simplify'
                ? 'চলো আরও সহজভাবে বুঝি: মনে করো একটি বর্গক্ষেত্রের বাহুর দৈর্ঘ্য $(a + b)$। ক্ষেত্রফল বের করতে $(a + b)$ কে $(a + b)$ দিয়ে গুণ করলে চারটি অংশ পাওয়া যায়: $a^2$, দুইটি $ab$, এবং $b^2$। তাই $(a + b)^2 = a^2 + 2ab + b^2$।'
                : 'এনসিটিবি পাঠ্যবই অনুসারে মূল ধারণা: '.$ragExcerpt,
            'WORKED_EXAMPLE' => 'চলো একটি আদর্শ সমাধান ধাপে ধাপে দেখি: $(2x + 3y)$ এর বর্গ নির্ণয় করতে হলে প্রথম পদ $a = 2x$ এবং দ্বিতীয় পদ $b = 3y$ ধরে সূত্র প্রয়োগ করি।',
            'ASK_STUDENT_QUESTION' => 'এবার তোমার পালা! নিচের প্রশ্নটি মনোযোগ দিয়ে সমাধান করো।',
            'IDENTIFY_MISCONCEPTION' => 'তুমি কাছাকাছি গিয়েছ, তবে এখানে একটি সাধারণ ভুল হয়েছে। বর্গের সূত্রে মাঝখানের পদটি $2ab$ নিতে হয় (শুধু $a^2 + b^2$ লিখলে $2ab$ বাদ পড়ে যায়) অথবা সদৃশ পদের সহগ যোগ করতে হয়। চলো ভুলটি ঠিক করে নিই।',
            'EXPLAIN_CORRECTION' => 'সঠিক নিয়মটি লক্ষ্য করো: $(a + b)^2 = a^2 + 2ab + b^2$। এখানে প্রথম পদের বর্গ + $2 \times$ প্রথম পদ $\times$ দ্বিতীয় পদ + দ্বিতীয় পদের বর্গ বসাতে হবে।',
            'ASK_SIMILAR_QUESTION' => 'দারুণ! ধারণাটি পাকা করার জন্য চলো একই নিয়মের আরেকটি সমজাতীয় সমস্যা সমাধান করি।',
            'INCREASE_DIFFICULTY' => 'অসাধারণ! তুমি মূল নিয়মটি চমৎকারভাবে আয়ত্ত করেছ। এবার একটু উচ্চতর দক্ষতার সমস্যার সমাধান করি।',
            'MINI_ASSESSMENT' => 'চমৎকার অগ্রগতি! এই পাঠের শিখনফল অর্জিত হয়েছে কি না তা যাচাই করতে এবার সংক্ষিপ্ত মূল্যায়ন (Mini-Assessment) প্রশ্নের উত্তর দাও (কোনো ইঙ্গিত ছাড়া)।',
            'SAVE_LEARNING_PROGRESS', 'COMPLETED' => 'অভিনন্দন! তুমি সফলভাবে আজকের পাঠ ও সংক্ষিপ্ত মূল্যায়ন সম্পন্ন করেছ। তোমার অগ্রগতি সংরক্ষণ করা হয়েছে।',
            default => 'চলো এনসিটিবি পাঠ্যক্রম অনুযায়ী পরের ধাপে এগিয়ে যাই: '.$ragExcerpt,
        };

        $questionPayload = $this->questionForStage($lessonStage);

        return [
            'lesson_stage' => $lessonStage,
            'response_type' => $this->responseTypeForStage($lessonStage),
            'explanation_bn' => $explanationBn,
            'worked_step_latex' => $this->workedLatexForStage($lessonStage),
            'nctb_reference' => $nctbRef,
            'evaluation_of_previous_answer' => [
                'was_answered' => $wasAnswered,
                'is_correct' => $wasAnswered ? $isCorrect : null,
                'misconception_code' => $wasAnswered && ! $isCorrect
                    ? ($misconceptionCode ?? 'ALG_FORMULA_MIDDLE_TERM_OMITTED')
                    : null,
                'confidence' => $wasAnswered ? 0.98 : null,
            ],
            'interactive_question' => $questionPayload,
            'hints' => [
                [
                    'level' => 1,
                    'text_bn' => 'প্রথম পদকে $a$ এবং দ্বিতীয় পদকে $b$ ধরে $(a + b)^2 = a^2 + 2ab + b^2$ সূত্রের সাথে তুলনা করো।',
                ],
                [
                    'level' => 2,
                    'text_bn' => 'মধ্যপদটি হবে $2 \times \text{প্রথম পদ} \times \text{দ্বিতীয় পদ}$। সহগগুলো গুণ করে মাঝখানে বসাও।',
                ],
                [
                    'level' => 3,
                    'text_bn' => 'ধাপটি দেখো: প্রথম পদের বর্গ + মধ্যপদ + দ্বিতীয় পদের বর্গ যোগ করলেই চূড়ান্ত রাশি পাওয়া যাবে।',
                ],
            ],
            'expected_learning_objective_code' => $objectiveCode,
            'allow_hint' => $lessonStage !== 'MINI_ASSESSMENT' && $lessonStage !== 'COMPLETED',
            'suggested_next_stage' => $suggestedNextStage,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function questionForStage(string $stage): array
    {
        return match ($stage) {
            'START_LESSON', 'CHECK_PREREQUISITES', 'TEACH_PREREQUISITE' => [
                'question_text_bn' => 'যদি $x = 5$ হয়, তবে $3x + 2x$ এর সরলফল কত (চলকসহ)?',
                'question_type' => 'short_answer',
                'difficulty' => 'easy',
                'expected_answer_canonical' => '5x',
                'accepted_equivalents' => ['5x', '5*x', '৫x', '25', '২৫'],
            ],
            'IDENTIFY_MISCONCEPTION', 'EXPLAIN_CORRECTION', 'ASK_SIMILAR_QUESTION' => [
                'question_text_bn' => 'এবার বলো তো, $4a + 3a =$ কত হবে?',
                'question_type' => 'short_answer',
                'difficulty' => 'easy',
                'expected_answer_canonical' => '7a',
                'accepted_equivalents' => ['7a', '7*a', '৭a'],
            ],
            'INCREASE_DIFFICULTY' => [
                'question_text_bn' => 'যদি $a + b = 7$ এবং $ab = 12$ হয়, তবে $a^2 + b^2$ এর মান কত?',
                'question_type' => 'short_answer',
                'difficulty' => 'hard',
                'expected_answer_canonical' => '25',
                'accepted_equivalents' => ['25', '২৫'],
            ],
            'MINI_ASSESSMENT' => [
                'question_text_bn' => 'সংক্ষিপ্ত মূল্যায়ন: $(x + 3)^2$ এর বিস্তৃতি নিচের কোনটি?',
                'question_type' => 'short_answer',
                'difficulty' => 'medium',
                'expected_answer_canonical' => 'x^2+6x+9',
                'accepted_equivalents' => ['x^2+6x+9', 'x^2 + 6x + 9', 'x²+6x+9'],
            ],
            default => [
                'question_text_bn' => 'সূত্রের সাহায্যে $(a + 5)^2$ এর বিস্তৃতি কী হবে?',
                'question_type' => 'short_answer',
                'difficulty' => 'medium',
                'expected_answer_canonical' => 'a^2+10a+25',
                'accepted_equivalents' => ['a^2+10a+25', 'a^2 + 10a + 25', 'a²+10a+25'],
            ],
        };
    }

    private function workedLatexForStage(string $stage): string
    {
        return match ($stage) {
            'START_LESSON', 'CHECK_PREREQUISITES', 'TEACH_PREREQUISITE' => '3x + 2x = (3 + 2)x = 5x',
            'INCREASE_DIFFICULTY' => 'a^2 + b^2 = (a + b)^2 - 2ab = 7^2 - 2(12) = 49 - 24 = 25',
            default => '(2x + 3y)^2 = (2x)^2 + 2(2x)(3y) + (3y)^2 = 4x^2 + 12xy + 9y^2',
        };
    }

    private function responseTypeForStage(string $stage): string
    {
        return match ($stage) {
            'START_LESSON', 'CHECK_PREREQUISITES' => 'prerequisite_probe',
            'TEACH_PREREQUISITE', 'EXPLAIN_CONCEPT' => 'concept_explanation',
            'WORKED_EXAMPLE' => 'worked_example',
            'IDENTIFY_MISCONCEPTION', 'EXPLAIN_CORRECTION' => 'remedial_question',
            'MINI_ASSESSMENT' => 'mini_assessment_item',
            'SAVE_LEARNING_PROGRESS', 'COMPLETED' => 'lesson_summary',
            default => 'guided_practice_question',
        };
    }

    private function defaultSuggestedNextStage(string $currentStage): string
    {
        return match ($currentStage) {
            'START_LESSON' => 'CHECK_PREREQUISITES',
            'CHECK_PREREQUISITES' => 'EXPLAIN_CONCEPT',
            'TEACH_PREREQUISITE' => 'EXPLAIN_CONCEPT',
            'EXPLAIN_CONCEPT' => 'WORKED_EXAMPLE',
            'WORKED_EXAMPLE' => 'ASK_STUDENT_QUESTION',
            'ASK_STUDENT_QUESTION' => 'INCREASE_DIFFICULTY',
            'IDENTIFY_MISCONCEPTION' => 'EXPLAIN_CORRECTION',
            'EXPLAIN_CORRECTION' => 'ASK_SIMILAR_QUESTION',
            'ASK_SIMILAR_QUESTION' => 'INCREASE_DIFFICULTY',
            'INCREASE_DIFFICULTY' => 'MINI_ASSESSMENT',
            'MINI_ASSESSMENT' => 'SAVE_LEARNING_PROGRESS',
            'SAVE_LEARNING_PROGRESS', 'COMPLETED' => 'COMPLETED',
            default => 'EXPLAIN_CONCEPT',
        };
    }

    /**
     * @param  array<string, mixed>  $ctx
     * @return array<string, mixed>
     */
    private function buildStudyPlannerPayload(array $ctx): array
    {
        return [
            'coach_message_bn' => 'তোমার নির্বাচিত অধ্যায় ও পূর্বজ্ঞান বিশ্লেষণ করে প্রতিদিনের রুটিন সাজানো হয়েছে। দুর্বল টপিকগুলোতে অতিরিক্ত অনুশীলনের সময় রাখা হয়েছে।',
            'total_tasks' => (int) ($ctx['total_tasks'] ?? 5),
        ];
    }

    /**
     * @param  array<string, mixed>  $ctx
     * @return array<string, mixed>
     */
    private function buildAnswerEvaluatorPayload(array $ctx): array
    {
        $maxMarks = (float) ($ctx['max_marks'] ?? 4.0);
        $awardedMarks = (float) ($ctx['awarded_marks'] ?? $maxMarks);

        return [
            'marks_awarded' => $awardedMarks,
            'max_marks' => $maxMarks,
            'confidence_score' => 0.92,
            'feedback_bn' => 'এনসিটিবি মূল্যায়ন রুব্রিক অনুযায়ী ধাপভিত্তিক নম্বর প্রদান করা হয়েছে।',
        ];
    }
}
