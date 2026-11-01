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
use App\Modules\Curriculum\Models\ObjectivePrerequisite;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Curriculum\Models\Topic;
use App\Modules\Students\Domain\Enums\EducationMedium;
use Illuminate\Database\Seeder;

class NctbCurriculumSeeder extends Seeder
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
            ],
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
                'changelog_notes' => 'এনসিটিবি (NCTB) ২০২৬ শিক্ষাবর্ষের ষষ্ঠ থেকে অষ্টম শ্রেণির বাংলা মাধ্যম পাঠ্যক্রম (গণিত ও বিজ্ঞান)।',
                'published_at' => now(),
            ]);
        }

        // Classes 6, 7, 8
        $class6 = AcademicClass::query()->updateOrCreate(
            ['curriculum_version_id' => $version->id, 'grade_level' => 6],
            [
                'education_stage' => EducationStage::LowerSecondary,
                'title_bn' => 'ষষ্ঠ শ্রেণি',
                'title_en' => 'Class 6',
                'teaching_persona_config' => [
                    'tone' => 'warm_encouraging',
                    'language_register' => 'simple_bangla_with_everyday_examples',
                ],
            ],
        );

        $class7 = AcademicClass::query()->updateOrCreate(
            ['curriculum_version_id' => $version->id, 'grade_level' => 7],
            [
                'education_stage' => EducationStage::LowerSecondary,
                'title_bn' => 'সপ্তম শ্রেণি',
                'title_en' => 'Class 7',
                'teaching_persona_config' => [
                    'tone' => 'supportive_structured',
                    'language_register' => 'standard_bangla_step_by_step',
                ],
            ],
        );

        $class8 = AcademicClass::query()->updateOrCreate(
            ['curriculum_version_id' => $version->id, 'grade_level' => 8],
            [
                'education_stage' => EducationStage::LowerSecondary,
                'title_bn' => 'অষ্টম শ্রেণি',
                'title_en' => 'Class 8',
                'teaching_persona_config' => [
                    'tone' => 'academic_mentor',
                    'language_register' => 'nctb_textbook_bangla_and_symbolic_math',
                ],
            ],
        );

        // Class 6 Math & Science
        $c6Math = Subject::query()->updateOrCreate(
            ['class_id' => $class6->id, 'slug' => 'mathematics'],
            [
                'nctb_subject_code' => '109',
                'title_bn' => 'গণিত',
                'title_en' => 'Mathematics',
                'exam_structure_json' => ['mcq_marks' => 30, 'creative_marks' => 70, 'total_marks' => 100],
                'sort_order' => 1,
                'is_active' => true,
            ],
        );

        Subject::query()->updateOrCreate(
            ['class_id' => $class6->id, 'slug' => 'science'],
            [
                'nctb_subject_code' => '127',
                'title_bn' => 'বিজ্ঞান',
                'title_en' => 'Science',
                'exam_structure_json' => ['mcq_marks' => 30, 'creative_marks' => 70, 'total_marks' => 100],
                'sort_order' => 2,
                'is_active' => true,
            ],
        );

        $c6MathCh4 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c6Math->id, 'chapter_number' => 4],
            [
                'title_bn' => 'বীজগণিতীয় রাশি',
                'title_en' => 'Algebraic Expressions',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 120,
                'sort_order' => 4,
            ],
        );

        $c6MathCh4T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c6MathCh4->id, 'topic_number' => '4.1'],
            [
                'title_bn' => 'চলক, সহগ, সূচক ও সদৃশ পদ',
                'title_en' => 'Variables, Coefficients, Exponents and Like Terms',
                'estimated_minutes' => 45,
                'difficulty_level' => 'easy',
                'sort_order' => 1,
            ],
        );

        $loC6Algebra1 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C6-MATH-CH4-T1-LO1'],
            [
                'topic_id' => $c6MathCh4T1->id,
                'title_bn' => 'বীজগণিতীয় প্রতীক, চলক ও সহগ শনাক্ত করতে পারবে',
                'title_en' => 'Identify algebraic symbols, variables, and coefficients',
                'bloom_level' => BloomLevel::Knowledge,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        $loC6Algebra2 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C6-MATH-CH4-T1-LO2'],
            [
                'topic_id' => $c6MathCh4T1->id,
                'title_bn' => 'সদৃশ ও বিসদৃশ পদের যোগ ও বিয়োগ করতে পারবে',
                'title_en' => 'Add and subtract like and unlike algebraic terms',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 2,
            ],
        );

        // Class 7 Math & Science
        $c7Math = Subject::query()->updateOrCreate(
            ['class_id' => $class7->id, 'slug' => 'mathematics'],
            [
                'nctb_subject_code' => '109',
                'title_bn' => 'গণিত',
                'title_en' => 'Mathematics',
                'exam_structure_json' => ['mcq_marks' => 30, 'creative_marks' => 70, 'total_marks' => 100],
                'sort_order' => 1,
                'is_active' => true,
            ],
        );

        Subject::query()->updateOrCreate(
            ['class_id' => $class7->id, 'slug' => 'science'],
            [
                'nctb_subject_code' => '127',
                'title_bn' => 'বিজ্ঞান',
                'title_en' => 'Science',
                'exam_structure_json' => ['mcq_marks' => 30, 'creative_marks' => 70, 'total_marks' => 100],
                'sort_order' => 2,
                'is_active' => true,
            ],
        );

        $c7MathCh5 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c7Math->id, 'chapter_number' => 5],
            [
                'title_bn' => 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
                'title_en' => 'Algebraic Formulas and Applications',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 150,
                'sort_order' => 5,
            ],
        );

        $c7MathCh5T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c7MathCh5->id, 'topic_number' => '5.1'],
            [
                'title_bn' => 'বর্গ নির্ণয়ে বীজগণিতীয় সূত্রের প্রাথমিক ধারণা',
                'title_en' => 'Introduction to Algebraic Square Formulas',
                'estimated_minutes' => 45,
                'difficulty_level' => 'medium',
                'sort_order' => 1,
            ],
        );

        $loC7Formula1 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C7-MATH-CH5-T1-LO1'],
            [
                'topic_id' => $c7MathCh5T1->id,
                'title_bn' => 'প্রথম ও দ্বিতীয় সূত্রের সাহায্যে দ্বিপদী রাশির বর্গ নির্ণয় করতে পারবে',
                'title_en' => 'Calculate the square of binomial expressions using first and second formulas',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        // Class 8 Mathematics (গণিত) & Science (বিজ্ঞান)
        $c8Math = Subject::query()->updateOrCreate(
            ['class_id' => $class8->id, 'slug' => 'mathematics'],
            [
                'nctb_subject_code' => '109',
                'title_bn' => 'গণিত',
                'title_en' => 'Mathematics',
                'exam_structure_json' => [
                    'mcq_marks' => 30,
                    'creative_marks' => 70,
                    'total_marks' => 100,
                    'sections' => ['পাটিগণিত', 'বীজগণিত', 'জ্যামিতি', 'তথ্য ও উপাত্ত'],
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
        );

        $c8Science = Subject::query()->updateOrCreate(
            ['class_id' => $class8->id, 'slug' => 'science'],
            [
                'nctb_subject_code' => '127',
                'title_bn' => 'বিজ্ঞান',
                'title_en' => 'Science',
                'exam_structure_json' => ['mcq_marks' => 30, 'creative_marks' => 70, 'total_marks' => 100],
                'sort_order' => 2,
                'is_active' => true,
            ],
        );

        // Class 8 Math Chapters
        Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Math->id, 'chapter_number' => 1],
            [
                'title_bn' => 'প্যাটার্ন',
                'title_en' => 'Patterns',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 120,
                'sort_order' => 1,
            ],
        );

        $c8MathCh4 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Math->id, 'chapter_number' => 4],
            [
                'title_bn' => 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ',
                'title_en' => 'Algebraic Formulas and Applications',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 180,
                'sort_order' => 4,
            ],
        );

        $c8MathCh6 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Math->id, 'chapter_number' => 6],
            [
                'title_bn' => 'সরল সহসমীকরণ',
                'title_en' => 'Simple Simultaneous Equations',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 160,
                'sort_order' => 6,
            ],
        );

        Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Math->id, 'chapter_number' => 8],
            [
                'title_bn' => 'চতুর্ভুজ ও জ্যামিতি',
                'title_en' => 'Quadrilaterals and Geometry',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 180,
                'sort_order' => 8,
            ],
        );

        // Topics & Learning Objectives for Class 8 Math Chapter 4
        $c8MathCh4T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c8MathCh4->id, 'topic_number' => '4.1'],
            [
                'title_bn' => 'বর্গের সূত্রাবলি ও অনুসিদ্ধান্তের প্রয়োগ',
                'title_en' => 'Square Formulas and Corollaries',
                'estimated_minutes' => 50,
                'difficulty_level' => 'medium',
                'sort_order' => 1,
            ],
        );

        $c8MathCh4T2 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c8MathCh4->id, 'topic_number' => '4.2'],
            [
                'title_bn' => 'ঘনের সূত্রাবলি ও উৎপাদকে বিশ্লেষণ',
                'title_en' => 'Cube Formulas and Factorization',
                'estimated_minutes' => 60,
                'difficulty_level' => 'hard',
                'sort_order' => 2,
            ],
        );

        $loC8MathCh4T1Lo1 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-MATH-CH4-T1-LO1'],
            [
                'topic_id' => $c8MathCh4T1->id,
                'title_bn' => 'দ্বিপদী ও ত্রিপদী রাশির বর্গ নির্ণয়ে $(a+b)^2$ এবং $(a-b)^2$ সূত্র প্রয়োগ করতে পারবে',
                'title_en' => 'Apply (a+b)^2 and (a-b)^2 formulas to expand binomial and trinomial squares',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        $loC8MathCh4T1Lo2 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-MATH-CH4-T1-LO2'],
            [
                'topic_id' => $c8MathCh4T1->id,
                'title_bn' => 'বর্গের অনুসিদ্ধান্ত ব্যবহার করে বীজগণিতীয় রাশির মান নির্ণয় ও প্রমাণ করতে পারবে',
                'title_en' => 'Evaluate and prove algebraic expressions using square corollaries',
                'bloom_level' => BloomLevel::HigherOrder,
                'mastery_threshold_pct' => 75,
                'sort_order' => 2,
            ],
        );

        $loC8MathCh4T2Lo1 = LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-MATH-CH4-T2-LO1'],
            [
                'topic_id' => $c8MathCh4T2->id,
                'title_bn' => '$(a+b)^3$ ও $(a-b)^3$ সূত্র ও অনুসিদ্ধান্ত প্রয়োগ করে ঘন নির্ণয় করতে পারবে',
                'title_en' => 'Apply cube formulas and corollaries to algebraic problems',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        // Class 8 Math Chapter 6 Topic & LO
        $c8MathCh6T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c8MathCh6->id, 'topic_number' => '6.1'],
            [
                'title_bn' => 'প্রতিস্থাপন ও অপনয়ন পদ্ধতিতে সরল সহসমীকরণ সমাধান',
                'title_en' => 'Solving Simultaneous Equations by Substitution and Elimination',
                'estimated_minutes' => 50,
                'difficulty_level' => 'medium',
                'sort_order' => 1,
            ],
        );

        LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-MATH-CH6-T1-LO1'],
            [
                'topic_id' => $c8MathCh6T1->id,
                'title_bn' => 'প্রতিস্থাপন ও অপনয়ন পদ্ধতিতে দুই চলকবিশিষ্ট সরল সহসমীকরণ সমাধান করতে পারবে',
                'title_en' => 'Solve two-variable linear simultaneous equations using substitution and elimination',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        // Class 8 Science Chapters & Objectives
        $c8SciCh6 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Science->id, 'chapter_number' => 6],
            [
                'title_bn' => 'পরমাণুর গঠন',
                'title_en' => 'Structure of Atoms',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 140,
                'sort_order' => 6,
            ],
        );

        $c8SciCh8 = Chapter::query()->updateOrCreate(
            ['subject_id' => $c8Science->id, 'chapter_number' => 8],
            [
                'title_bn' => 'রাসায়নিক বিক্রিয়া',
                'title_en' => 'Chemical Reactions',
                'syllabus_status' => 'included',
                'estimated_study_minutes' => 150,
                'sort_order' => 8,
            ],
        );

        $c8SciCh6T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c8SciCh6->id, 'topic_number' => '6.1'],
            [
                'title_bn' => 'পারমাণবিক সংখ্যা, ভরসংখ্যা ও ইলেকট্রন বিন্যাস',
                'title_en' => 'Atomic Number, Mass Number and Electron Configuration',
                'estimated_minutes' => 45,
                'difficulty_level' => 'medium',
                'sort_order' => 1,
            ],
        );

        $loC8SciAtom = LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-SCI-CH6-T1-LO1'],
            [
                'topic_id' => $c8SciCh6T1->id,
                'title_bn' => 'মৌলের পারমাণবিক সংখ্যা, ভরসংখ্যা ও ইলেকট্রন বিন্যাস ব্যাখ্যা করতে পারবে',
                'title_en' => 'Explain atomic number, mass number, and electron configuration of elements',
                'bloom_level' => BloomLevel::Comprehension,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        $c8SciCh8T1 = Topic::query()->updateOrCreate(
            ['chapter_id' => $c8SciCh8->id, 'topic_number' => '8.1'],
            [
                'title_bn' => 'প্রতীক, সংকেত, যোজনী ও রাসায়নিক সমীকরণ',
                'title_en' => 'Symbols, Formulas, Valency and Chemical Equations',
                'estimated_minutes' => 50,
                'difficulty_level' => 'medium',
                'sort_order' => 1,
            ],
        );

        $loC8SciReaction = LearningObjective::query()->updateOrCreate(
            ['code' => 'C8-SCI-CH8-T1-LO1'],
            [
                'topic_id' => $c8SciCh8T1->id,
                'title_bn' => 'রাসায়নিক সমীকরণ সমতাকরণ ও বিক্রিয়ার প্রকারভেদ বিশ্লেষণ করতে পারবে',
                'title_en' => 'Balance chemical equations and classify chemical reactions',
                'bloom_level' => BloomLevel::Application,
                'mastery_threshold_pct' => 75,
                'sort_order' => 1,
            ],
        );

        // Seed DAG Prerequisite Links
        $dagEdges = [
            [$loC6Algebra2->id, $loC6Algebra1->id],
            [$loC7Formula1->id, $loC6Algebra2->id],
            [$loC8MathCh4T1Lo1->id, $loC7Formula1->id],
            [$loC8MathCh4T1Lo2->id, $loC8MathCh4T1Lo1->id],
            [$loC8MathCh4T2Lo1->id, $loC8MathCh4T1Lo2->id],
            [$loC8SciReaction->id, $loC8SciAtom->id],
        ];

        foreach ($dagEdges as [$objectiveId, $prereqId]) {
            ObjectivePrerequisite::query()->updateOrCreate(
                [
                    'learning_objective_id' => $objectiveId,
                    'prerequisite_objective_id' => $prereqId,
                ],
                ['is_strict' => true],
            );
        }
    }
}
