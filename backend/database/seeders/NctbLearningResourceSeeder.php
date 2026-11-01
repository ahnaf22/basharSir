<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\AcademicContent\Domain\Enums\ResourceType;
use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use App\Modules\AcademicContent\Jobs\IndexPublishedResourceJob;
use App\Modules\AcademicContent\Models\LearningResource;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use Illuminate\Database\Seeder;

class NctbLearningResourceSeeder extends Seeder
{
    public function run(): void
    {
        /** @var CurriculumVersion|null $version */
        $version = CurriculumVersion::query()
            ->where('version_code', 'NCTB-2026-BM-v1.0')
            ->first();

        if ($version === null) {
            $this->call(NctbCurriculumSeeder::class);
            /** @var CurriculumVersion $version */
            $version = CurriculumVersion::query()
                ->where('version_code', 'NCTB-2026-BM-v1.0')
                ->firstOrFail();
        }

        /** @var LearningObjective $loMathSquare */
        $loMathSquare = LearningObjective::query()
            ->with('topic')
            ->where('code', 'C8-MATH-CH4-T1-LO1')
            ->firstOrFail();

        $mathLessonNote = LearningResource::query()->updateOrCreate(
            [
                'learning_objective_id' => $loMathSquare->id,
                'resource_type' => ResourceType::LessonNote,
            ],
            [
                'curriculum_version_id' => $version->id,
                'chapter_id' => $loMathSquare->topic->chapter_id,
                'topic_id' => $loMathSquare->topic_id,
                'title_bn' => 'পাঠ নোট: দ্বিপদী রাশির বর্গ নির্ণয়ের সূত্র ও জ্যামিতিক ব্যাখ্যা',
                'content_markdown' => implode("\n\n", [
                    '### সূত্র ১: দুইটি রাশির যোগফলের বর্গ',
                    'দুইটি রাশির যোগফলের বর্গ সমান প্রথম রাশির বর্গ যোগ দুই গুণ প্রথম রাশি গুণ দ্বিতীয় রাশি যোগ দ্বিতীয় রাশির বর্গ:',
                    '$$(a + b)^2 = a^2 + 2ab + b^2$$',
                    '### সূত্র ২: দুইটি রাশির বিয়োগফলের বর্গ',
                    'দুইটি রাশির বিয়োগফলের বর্গ সমান প্রথম রাশির বর্গ বিয়োগ দুই গুণ প্রথম রাশি গুণ দ্বিতীয় রাশি যোগ দ্বিতীয় রাশির বর্গ:',
                    '$$(a - b)^2 = a^2 - 2ab + b^2$$',
                    '### সমাধানকৃত উদাহরণ',
                    'প্রশ্ন: $(3x + 5y)^2$ এর বর্গ নির্ণয় করো। সমাধান: এখানে প্রথম পদ $a = 3x$ এবং দ্বিতীয় পদ $b = 5y$। অতএব, $(3x + 5y)^2 = (3x)^2 + 2(3x)(5y) + (5y)^2 = 9x^2 + 30xy + 25y^2$।',
                ]),
                'nctb_page_reference' => 'পৃষ্ঠা ৪৭–৫২',
                'workflow_status' => ResourceWorkflowStatus::Published,
                'published_at' => now(),
            ],
        );

        IndexPublishedResourceJob::dispatchSync($mathLessonNote->id);

        $mathFormulaSheet = LearningResource::query()->updateOrCreate(
            [
                'learning_objective_id' => $loMathSquare->id,
                'resource_type' => ResourceType::FormulaSheet,
            ],
            [
                'curriculum_version_id' => $version->id,
                'chapter_id' => $loMathSquare->topic->chapter_id,
                'topic_id' => $loMathSquare->topic_id,
                'title_bn' => 'সূত্র তালিকা: অধ্যায় ৪ (বীজগণিতীয় বর্গ ও অনুসিদ্ধান্ত)',
                'content_markdown' => implode("\n", [
                    '১. $(a + b)^2 = a^2 + 2ab + b^2$',
                    '২. $(a - b)^2 = a^2 - 2ab + b^2$',
                    '৩. $a^2 - b^2 = (a + b)(a - b)$',
                    '৪. অনুসিদ্ধান্ত: $a^2 + b^2 = (a + b)^2 - 2ab = (a - b)^2 + 2ab$',
                    '৫. অনুসিদ্ধান্ত: $4ab = (a + b)^2 - (a - b)^2$',
                ]),
                'nctb_page_reference' => 'পৃষ্ঠা ৪৮–৫৪',
                'workflow_status' => ResourceWorkflowStatus::Published,
                'published_at' => now(),
            ],
        );

        IndexPublishedResourceJob::dispatchSync($mathFormulaSheet->id);

        /** @var LearningObjective $loSciAtom */
        $loSciAtom = LearningObjective::query()
            ->with('topic')
            ->where('code', 'C8-SCI-CH6-T1-LO1')
            ->firstOrFail();

        $sciLessonNote = LearningResource::query()->updateOrCreate(
            [
                'learning_objective_id' => $loSciAtom->id,
                'resource_type' => ResourceType::LessonNote,
            ],
            [
                'curriculum_version_id' => $version->id,
                'chapter_id' => $loSciAtom->topic->chapter_id,
                'topic_id' => $loSciAtom->topic_id,
                'title_bn' => 'পাঠ নোট: পরমাণুর কণিকাসমূহ, পারমাণবিক সংখ্যা ও ভরসংখ্যা',
                'content_markdown' => implode("\n\n", [
                    '### পরমাণুর মূল কণিকা',
                    'পরমাণুতে তিনটি স্থায়ী কণিকা থাকে: ইলেকট্রন ($e^-$), প্রোটন ($p^+$) এবং নিউট্রন ($n^0$)।',
                    '### পারমাণবিক সংখ্যা ও ভরসংখ্যা',
                    'কোনো মৌলের একটি পরমাণুর নিউক্লিয়াসে উপস্থিত প্রোটন সংখ্যাকে ঐ মৌলের **পারমাণবিক সংখ্যা** ($Z$) বলে। নিউক্লিয়াসে অবস্থিত প্রোটন ও নিউট্রন সংখ্যার সমষ্টিকে **ভরসংখ্যা** ($A = Z + N$) বলে।',
                    'শক্তিস্তরে সর্বোচ্চ ইলেকট্রন ধারণক্ষমতার সূত্র: $$2n^2$$ (যেখানে $n = 1, 2, 3...$ কক্ষপথের ক্রম)।',
                ]),
                'nctb_page_reference' => 'পৃষ্ঠা ৫৭–৬২',
                'workflow_status' => ResourceWorkflowStatus::Published,
                'published_at' => now(),
            ],
        );

        IndexPublishedResourceJob::dispatchSync($sciLessonNote->id);
    }
}
