<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\QuestionBank\Models\MarkingRubric;
use App\Modules\QuestionBank\Models\Question;
use Illuminate\Database\Seeder;

final class NctbQuestionBankSeeder extends Seeder
{
    public function run(): void
    {
        $lo1 = LearningObjective::query()->where('code', 'C8-MATH-CH4-T1-LO1')->first();
        if ($lo1 === null) {
            return;
        }

        $lo1->loadMissing('topic.chapter.subject.academicClass');
        $topic = $lo1->topic;
        $chapter = $topic->chapter;
        $subject = $chapter->subject;
        $curriculumVersionId = $subject->academicClass->curriculum_version_id;

        // 1. Single MCQ (`mcq_single`)
        Question::query()->firstOrCreate(
            [
                'learning_objective_id' => $lo1->id,
                'question_type' => 'mcq_single',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $topic->id,
                'difficulty' => 'easy',
                'marks' => '1.00',
                'stem_markdown' => '$(a + 3)^2$ এর বিস্তৃতি নিচের কোনটি?',
                'options_json' => [
                    ['key' => 'A', 'text_bn' => '$a^2 + 3a + 9$'],
                    ['key' => 'B', 'text_bn' => '$a^2 + 6a + 9$'],
                    ['key' => 'C', 'text_bn' => '$a^2 - 6a + 9$'],
                    ['key' => 'D', 'text_bn' => '$a^2 + 9$'],
                ],
                'deterministic_answer_key_json' => [
                    'correct_option_key' => 'B',
                    'accepted_equivalents' => ['B', 'a^2+6a+9'],
                    'explanation_bn' => '$(a+3)^2 = a^2 + 2(a)(3) + 3^2 = a^2 + 6a + 9$।',
                ],
                'status' => 'published',
            ]
        );

        // 2. Multi-Statement NCTB MCQ (`mcq_multi_statement` — বহুপদী সমাপ্তিসূচক)
        Question::query()->firstOrCreate(
            [
                'learning_objective_id' => $lo1->id,
                'question_type' => 'mcq_multi_statement',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $topic->id,
                'difficulty' => 'medium',
                'marks' => '1.00',
                'stem_markdown' => 'বীজগণিতীয় বর্গের সূত্র অনুযায়ী: (i) $(a + b)^2 = a^2 + 2ab + b^2$ (ii) $(a - b)^2 = a^2 - 2ab + b^2$ (iii) $a^2 + b^2 = (a + b)^2 - 2ab$ নিচের কোনটি সঠিক?',
                'options_json' => [
                    ['key' => 'A', 'text_bn' => 'i ও ii'],
                    ['key' => 'B', 'text_bn' => 'i ও iii'],
                    ['key' => 'C', 'text_bn' => 'ii ও iii'],
                    ['key' => 'D', 'text_bn' => 'i, ii ও iii'],
                ],
                'deterministic_answer_key_json' => [
                    'correct_option_key' => 'D',
                    'accepted_equivalents' => ['D'],
                    'explanation_bn' => 'তিনটি সূত্র ও অনুসিদ্ধান্তই এনসিটিবি পাঠ্যবই অনুযায়ী সঠিক।',
                ],
                'status' => 'published',
            ]
        );

        // 3. Fill-in-the-blank (`fill_blank`)
        Question::query()->firstOrCreate(
            [
                'learning_objective_id' => $lo1->id,
                'question_type' => 'fill_blank',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $topic->id,
                'difficulty' => 'easy',
                'marks' => '1.00',
                'stem_markdown' => 'যদি $a + b = 5$ এবং $ab = 6$ হয়, তবে $a^2 + b^2$ এর মান ______।',
                'deterministic_answer_key_json' => [
                    'canonical_answer' => '13',
                    'accepted_equivalents' => ['13', '১৩'],
                    'explanation_bn' => '$a^2 + b^2 = (a+b)^2 - 2ab = 25 - 12 = 13$।',
                ],
                'status' => 'published',
            ]
        );

        // 4. Math Problem (`math_problem` — 4 marks) with structured step-wise MarkingRubric
        $mathProblem = Question::query()->firstOrCreate(
            [
                'learning_objective_id' => $lo1->id,
                'question_type' => 'math_problem',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $topic->id,
                'difficulty' => 'medium',
                'marks' => '4.00',
                'stem_markdown' => 'দেওয়া আছে $a + b = 7$ এবং $ab = 12$। অনুসিদ্ধান্ত প্রয়োগ করে $(a - b)^2$ এর মান নির্ণয় করো।',
                'status' => 'published',
            ]
        );

        MarkingRubric::query()->firstOrCreate(
            ['question_id' => $mathProblem->id],
            [
                'expected_answer_markdown' => 'দেওয়া আছে $a + b = 7, ab = 12$। আমরা জানি $(a - b)^2 = (a + b)^2 - 4ab = 7^2 - 4(12) = 49 - 48 = 1$।',
                'step_wise_marks_json' => [
                    [
                        'step_id' => 'S1',
                        'description_bn' => 'দেওয়া আছে মানগুলো সঠিকভাবে লেখা ($a + b = 7, ab = 12$)',
                        'marks' => 1.0,
                        'required_keywords' => ['a+b=7', 'ab=12'],
                    ],
                    [
                        'step_id' => 'S2',
                        'description_bn' => 'অনুসিদ্ধান্ত সূত্র প্রয়োগ: $(a - b)^2 = (a + b)^2 - 4ab$',
                        'marks' => 1.5,
                        'required_keywords' => ['(a+b)^2-4ab', '4ab'],
                    ],
                    [
                        'step_id' => 'S3',
                        'description_bn' => 'মান বসিয়ে চূড়ান্ত সঠিক উত্তর নির্ণয় ($49 - 48 = 1$)',
                        'marks' => 1.5,
                        'required_keywords' => ['49-48', '=1', '1'],
                    ],
                ],
                'required_points_json' => ['a+b=7', '(a+b)^2-4ab', '49-48=1'],
                'accepted_alternatives_json' => ['a^2+b^2=25 বের করে (a-b)^2=1 নির্ণয়'],
                'common_mistakes_json' => [
                    [
                        'code' => 'SIGN_ERROR_IN_COROLLARY',
                        'trigger_keyword' => '-2ab',
                        'description_bn' => '$-4ab$ এর পরিবর্তে $-2ab$ লেখা হয়েছে',
                        'max_partial_marks_for_step' => 0.0,
                    ],
                ],
                'nctb_reference' => 'অষ্টম শ্রেণি গণিত, পৃষ্ঠা ৫২, অনুশীলনী ৪.১',
            ]
        );

        // 5. Creative Question (`creative_srijonshil` — সৃজনশীল ১০ নম্বর: ক=১, খ=২, গ=৩, ঘ=৪)
        $creativeQuestion = Question::query()->firstOrCreate(
            [
                'learning_objective_id' => $lo1->id,
                'question_type' => 'creative_srijonshil',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $topic->id,
                'difficulty' => 'hard',
                'marks' => '10.00',
                'stem_markdown' => 'উদ্দীপক: $x + \frac{1}{x} = 4$ একটি বীজগণিতীয় সমীকরণ।',
                'sub_questions_json' => [
                    ['part' => 'ক', 'marks' => 1, 'text_bn' => '$(x + \frac{1}{x})^2$ এর সূত্রটি লেখো।'],
                    ['part' => 'খ', 'marks' => 2, 'text_bn' => '$x^2 + \frac{1}{x^2}$ এর মান নির্ণয় করো।'],
                    ['part' => 'গ', 'marks' => 3, 'text_bn' => 'প্রমাণ করো যে, $x^4 + \frac{1}{x^4} = 194$।'],
                    ['part' => 'ঘ', 'marks' => 4, 'text_bn' => '$(x - \frac{1}{x})^2$ এর মান নির্ণয় করে বিশ্লেষণ করো।'],
                ],
                'status' => 'published',
            ]
        );

        MarkingRubric::query()->firstOrCreate(
            ['question_id' => $creativeQuestion->id],
            [
                'expected_answer_markdown' => 'ক) $x^2 + 2 + \frac{1}{x^2}$, খ) $14$, গ) $194$, ঘ) $12$',
                'step_wise_marks_json' => [
                    [
                        'step_id' => 'PART_KA',
                        'description_bn' => 'ক) বর্গের সূত্রটি সঠিকভাবে লেখা',
                        'marks' => 1.0,
                        'required_keywords' => ['x^2+2+1/x^2', '2'],
                    ],
                    [
                        'step_id' => 'PART_KHA',
                        'description_bn' => 'খ) $x^2 + 1/x^2 = 4^2 - 2 = 14$ নির্ণয়',
                        'marks' => 2.0,
                        'required_keywords' => ['14', '১৪'],
                    ],
                    [
                        'step_id' => 'PART_GA',
                        'description_bn' => 'গ) পুনরায় বর্গ করে $14^2 - 2 = 194$ প্রমাণ',
                        'marks' => 3.0,
                        'required_keywords' => ['194', '১৯৪'],
                    ],
                    [
                        'step_id' => 'PART_GHA',
                        'description_bn' => 'ঘ) $(x - 1/x)^2 = 4^2 - 4 = 12$ নির্ণয়',
                        'marks' => 4.0,
                        'required_keywords' => ['12', '১২'],
                    ],
                ],
                'required_points_json' => ['14', '194', '12'],
                'accepted_alternatives_json' => ['১৪', '১৯৪', '১২'],
                'common_mistakes_json' => [],
                'nctb_reference' => 'অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়, পৃষ্ঠা ৫৪ (সৃজনশীল অনুশীলনী)',
            ]
        );
    }
}
