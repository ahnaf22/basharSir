<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Curriculum\Domain\Enums\BloomLevel;
use App\Modules\Curriculum\Domain\Enums\CurriculumVersionStatus;
use App\Modules\Curriculum\Domain\Enums\EducationStage;
use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\AcademicYear;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Curriculum\Models\Topic;
use App\Modules\Students\Domain\Enums\EducationMedium;
use Illuminate\Database\Seeder;

final class NctbClassOneToTenExpansionSeeder extends Seeder
{
    public function run(): void
    {
        $academicYear = AcademicYear::query()->updateOrCreate(
            ['year_code' => '2026'],
            [
                'title_bn' => 'শিক্ষাবর্ষ ২০২৬',
                'starts_on' => '2026-01-01',
                'ends_on' => '2026-12-31',
                'is_current' => true,
            ]
        );

        /** @var CurriculumVersion|null $version */
        $version = CurriculumVersion::query()
            ->where('version_code', 'NCTB-2026-BM-v1.0')
            ->first();

        if ($version === null) {
            $version = CurriculumVersion::query()->create([
                'academic_year_id' => $academicYear->id,
                'version_code' => 'NCTB-2026-BM-v1.0',
                'board' => 'NCTB',
                'medium' => EducationMedium::Bangla,
                'status' => CurriculumVersionStatus::Published,
                'effective_from' => '2026-01-01',
                'effective_to' => '2026-12-31',
                'changelog_notes' => 'এনসিটিবি (NCTB) ২০২৬ শিক্ষাবর্ষের ১ম থেকে ১০ম শ্রেণি পাঠ্যক্রম।',
                'published_at' => now(),
            ]);
        }

        // Primary Classes 1–5
        $primaryGrades = [
            1 => ['প্রথম শ্রেণি', 'Class 1'],
            2 => ['দ্বিতীয় শ্রেণি', 'Class 2'],
            3 => ['তৃতীয় শ্রেণি', 'Class 3'],
            4 => ['চতুর্থ শ্রেণি', 'Class 4'],
            5 => ['পঞ্চম শ্রেণি', 'Class 5'],
        ];

        foreach ($primaryGrades as $grade => [$titleBn, $titleEn]) {
            $primaryClass = AcademicClass::query()->updateOrCreate(
                ['curriculum_version_id' => $version->id, 'grade_level' => $grade],
                [
                    'education_stage' => EducationStage::Primary,
                    'title_bn' => $titleBn,
                    'title_en' => $titleEn,
                    'teaching_persona_config' => [
                        'tone' => 'playful_storytelling',
                        'language_register' => 'child_friendly_bangla',
                    ],
                ]
            );

            $mathSubj = Subject::query()->updateOrCreate(
                ['class_id' => $primaryClass->id, 'slug' => 'primary-mathematics'],
                [
                    'nctb_subject_code' => '10'.$grade,
                    'title_bn' => 'প্রাথমিক গণিত',
                    'title_en' => 'Primary Mathematics',
                    'exam_structure_json' => ['mcq_marks' => 20, 'creative_marks' => 80, 'total_marks' => 100],
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            );

            $ch1 = Chapter::query()->updateOrCreate(
                ['subject_id' => $mathSubj->id, 'chapter_number' => 1],
                [
                    'title_bn' => 'সংখ্যা ও স্থানীয় মান',
                    'title_en' => 'Numbers and Place Value',
                    'syllabus_status' => 'included',
                    'estimated_study_minutes' => 60,
                    'sort_order' => 1,
                ]
            );

            $t1 = Topic::query()->updateOrCreate(
                ['chapter_id' => $ch1->id, 'topic_number' => '1.1'],
                [
                    'title_bn' => 'গণনা ও সংখ্যার তুলনা',
                    'title_en' => 'Counting and Comparing Numbers',
                    'estimated_minutes' => 30,
                    'difficulty_level' => 'easy',
                    'sort_order' => 1,
                ]
            );

            LearningObjective::query()->updateOrCreate(
                ['code' => "C{$grade}-MATH-CH1-T1-LO1"],
                [
                    'topic_id' => $t1->id,
                    'title_bn' => 'স্থানীয় মানের সাহায্যে সংখ্যা চিনতে ও লিখতে পারা',
                    'title_en' => 'Identify and write numbers using place value',
                    'bloom_level' => BloomLevel::Knowledge,
                    'mastery_threshold_pct' => 75,
                    'sort_order' => 1,
                ]
            );
        }

        // Secondary SSC Classes 9–10
        $sscGrades = [
            9 => ['নবম শ্রেণি (SSC)', 'Class 9 (SSC)'],
            10 => ['দশম শ্রেণি (SSC)', 'Class 10 (SSC)'],
        ];

        foreach ($sscGrades as $grade => [$titleBn, $titleEn]) {
            $sscClass = AcademicClass::query()->updateOrCreate(
                ['curriculum_version_id' => $version->id, 'grade_level' => $grade],
                [
                    'education_stage' => EducationStage::Secondary,
                    'title_bn' => $titleBn,
                    'title_en' => $titleEn,
                    'teaching_persona_config' => [
                        'tone' => 'rigorous_board_exam_coach',
                        'language_register' => 'formal_nctb_ssc_bangla',
                    ],
                ]
            );

            $physics = Subject::query()->updateOrCreate(
                ['class_id' => $sscClass->id, 'slug' => 'physics'],
                [
                    'nctb_subject_code' => '136',
                    'title_bn' => 'পদার্থবিজ্ঞান (Physics)',
                    'title_en' => 'Physics',
                    'exam_structure_json' => ['mcq_marks' => 25, 'creative_marks' => 50, 'practical_marks' => 25, 'total_marks' => 100],
                    'sort_order' => 1,
                    'is_active' => true,
                ]
            );

            $ch2 = Chapter::query()->updateOrCreate(
                ['subject_id' => $physics->id, 'chapter_number' => 2],
                [
                    'title_bn' => 'গতি (Motion)',
                    'title_en' => 'Motion',
                    'syllabus_status' => 'included',
                    'estimated_study_minutes' => 150,
                    'sort_order' => 2,
                ]
            );

            $t1 = Topic::query()->updateOrCreate(
                ['chapter_id' => $ch2->id, 'topic_number' => '2.1'],
                [
                    'title_bn' => 'গতির সমীকরণ $v = u + at$ ও $s = ut + \\frac{1}{2}at^2$',
                    'title_en' => 'Equations of Motion',
                    'estimated_minutes' => 60,
                    'difficulty_level' => 'medium',
                    'sort_order' => 1,
                ]
            );

            LearningObjective::query()->updateOrCreate(
                ['code' => "C{$grade}-PHY-CH2-T1-LO1"],
                [
                    'topic_id' => $t1->id,
                    'title_bn' => 'সমত্বরণে গতিশীল বস্তুর গতির সমীকরণ প্রতিপাদন ও গাণিতিক সমস্যার সমাধান',
                    'title_en' => 'Derive and solve equations of motion under uniform acceleration',
                    'bloom_level' => BloomLevel::Application,
                    'mastery_threshold_pct' => 75,
                    'sort_order' => 1,
                ]
            );
        }
    }
}
