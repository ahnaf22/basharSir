<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Services\ExamGeneratorService;
use App\Modules\Examinations\Services\ExamLifecycleService;
use App\Modules\Gamification\Services\EthicalGamificationService;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\Domain\Enums\GuardianRelationType;
use App\Modules\Guardians\Models\ConsentRecord;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\LearningAnalytics\Services\MasteryCalculationService;
use App\Modules\Payments\Domain\Models\Payment;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use App\Modules\Students\Domain\Enums\EducationMedium;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use App\Modules\Subscriptions\Domain\Models\Subscription;
use App\Modules\Subscriptions\Domain\Models\SubscriptionPlan;
use App\Modules\Subscriptions\Seeders\SubscriptionPlanSeeder;
use App\Modules\Tutoring\Services\TutorEngineService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            NctbCurriculumSeeder::class,
            NctbLearningResourceSeeder::class,
            NctbQuestionBankSeeder::class,
            SubscriptionPlanSeeder::class,
        ]);

        // 1. Create Primary UI Demo Guardian (Phone: 01911223344, Pass: GuardianPass123!)
        /** @var User $demoGuardianUser */
        $demoGuardianUser = User::query()->firstOrCreate(
            ['phone' => '+8801911223344'],
            [
                'name_bn' => 'রাশেদা বেগম',
                'name_en' => 'Rasheda Begum',
                'email' => 'guardian.demo@porahobe.com',
                'password' => Hash::make('GuardianPass123!'),
                'account_type' => AccountType::Guardian,
                'status' => AccountStatus::Active,
                'phone_verified_at' => Carbon::now(),
            ]
        );

        /** @var GuardianProfile $demoGuardian */
        $demoGuardian = GuardianProfile::query()->firstOrCreate(
            ['user_id' => $demoGuardianUser->id],
            [
                'relation_type' => GuardianRelationType::Mother,
                'preferred_language' => 'bn',
                'weekly_report_channel' => 'sms_and_email',
            ]
        );

        // 1b. Create Secondary Demo Guardian (Phone: 01712000000, Pass: password123)
        /** @var User $guardianUser */
        $guardianUser = User::query()->firstOrCreate(
            ['phone' => '+8801712000000'],
            [
                'name_bn' => 'রাশেদা বেগম',
                'name_en' => 'Rasheda Begum',
                'email' => 'rasheda.guardian@example.com',
                'password' => Hash::make('password123'),
                'account_type' => AccountType::Guardian,
                'status' => AccountStatus::Active,
                'phone_verified_at' => Carbon::now(),
            ]
        );

        /** @var GuardianProfile $guardian */
        $guardian = GuardianProfile::query()->firstOrCreate(
            ['user_id' => $guardianUser->id],
            [
                'relation_type' => GuardianRelationType::Mother,
                'preferred_language' => 'bn',
                'weekly_report_channel' => 'sms_and_email',
            ]
        );

        // 2. Create Primary UI Demo Student (Phone: 01712345678, Pass: SecurePass123!)
        /** @var User $demoStudentUser */
        $demoStudentUser = User::query()->firstOrCreate(
            ['phone' => '+8801712345678'],
            [
                'name_bn' => 'রাফি আহমেদ',
                'name_en' => 'Rafi Ahmed',
                'email' => 'student.demo@porahobe.com',
                'password' => Hash::make('SecurePass123!'),
                'account_type' => AccountType::Student,
                'status' => AccountStatus::Active,
                'phone_verified_at' => Carbon::now(),
            ]
        );

        /** @var StudentProfile $demoStudent */
        $demoStudent = StudentProfile::query()->firstOrCreate(
            ['user_id' => $demoStudentUser->id],
            [
                'student_code' => 'STU-2026-DEMO',
                'current_class_level' => 8,
                'medium' => EducationMedium::Bangla,
                'school_name' => 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ',
                'district' => 'ঢাকা',
                'date_of_birth' => '2012-04-15',
                'consent_status' => ConsentStatus::Verified,
                'guardian_phone_invited' => '+8801911223344',
                'daily_study_target_mins' => 45,
                'pseudonym' => 'ধ্রুবতারা-ডেমো',
            ]
        );

        StudentGuardianLink::query()->firstOrCreate(
            [
                'student_id' => $demoStudent->id,
                'guardian_id' => $demoGuardian->id,
            ],
            [
                'is_primary_payer' => true,
                'status' => GuardianLinkStatus::Verified,
                'verified_at' => Carbon::now(),
            ]
        );

        ConsentRecord::query()->firstOrCreate(
            [
                'student_id' => $demoStudent->id,
                'guardian_id' => $demoGuardian->id,
            ],
            [
                'policy_version' => 'PDPA-2026-v1',
                'consent_scope_json' => ['academic_tutoring' => true, 'analytics' => true],
                'verification_method' => 'otp_sms',
                'ip_address' => '127.0.0.1',
                'consented_at' => Carbon::now(),
            ]
        );

        // 2b. Create Demo Student 1: Rafi Ahmed (Class 8, Phone: 01712000001, Pass: password123)
        /** @var User $studentUser1 */
        $studentUser1 = User::query()->firstOrCreate(
            ['phone' => '+8801712000001'],
            [
                'name_bn' => 'রাফি আহমেদ',
                'name_en' => 'Rafi Ahmed',
                'email' => 'rafi.student@example.com',
                'password' => Hash::make('password123'),
                'account_type' => AccountType::Student,
                'status' => AccountStatus::Active,
                'phone_verified_at' => Carbon::now(),
            ]
        );

        /** @var StudentProfile $student1 */
        $student1 = StudentProfile::query()->firstOrCreate(
            ['user_id' => $studentUser1->id],
            [
                'student_code' => 'STU-2026-8001',
                'current_class_level' => 8,
                'medium' => EducationMedium::Bangla,
                'school_name' => 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ',
                'district' => 'ঢাকা',
                'date_of_birth' => '2012-04-15',
                'consent_status' => ConsentStatus::Verified,
                'guardian_phone_invited' => '+8801712000000',
                'daily_study_target_mins' => 45,
                'pseudonym' => 'ধ্রুবতারা-১০১',
            ]
        );

        StudentGuardianLink::query()->firstOrCreate(
            [
                'student_id' => $student1->id,
                'guardian_id' => $guardian->id,
            ],
            [
                'is_primary_payer' => true,
                'status' => GuardianLinkStatus::Verified,
                'verified_at' => Carbon::now(),
            ]
        );

        ConsentRecord::query()->firstOrCreate(
            [
                'student_id' => $student1->id,
                'guardian_id' => $guardian->id,
            ],
            [
                'policy_version' => 'PDPA-2026-v1',
                'consent_scope_json' => ['academic_tutoring' => true, 'analytics' => true],
                'verification_method' => 'otp_sms',
                'ip_address' => '127.0.0.1',
                'consented_at' => Carbon::now(),
            ]
        );

        // 3. Create Demo Student 2: Nusrat Ahmed (Class 6, Phone: 01712000002, Pass: password123)
        /** @var User $studentUser2 */
        $studentUser2 = User::query()->firstOrCreate(
            ['phone' => '+8801712000002'],
            [
                'name_bn' => 'নুসরাত আহমেদ',
                'name_en' => 'Nusrat Ahmed',
                'email' => 'nusrat.student@example.com',
                'password' => Hash::make('password123'),
                'account_type' => AccountType::Student,
                'status' => AccountStatus::Active,
                'phone_verified_at' => Carbon::now(),
            ]
        );

        /** @var StudentProfile $student2 */
        $student2 = StudentProfile::query()->firstOrCreate(
            ['user_id' => $studentUser2->id],
            [
                'student_code' => 'STU-2026-6002',
                'current_class_level' => 6,
                'medium' => EducationMedium::Bangla,
                'school_name' => 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ',
                'district' => 'ঢাকা',
                'date_of_birth' => '2014-08-20',
                'consent_status' => ConsentStatus::Verified,
                'guardian_phone_invited' => '+8801712000000',
                'daily_study_target_mins' => 30,
                'pseudonym' => 'অনুসন্ধানী-২০২',
            ]
        );

        StudentGuardianLink::query()->firstOrCreate(
            [
                'student_id' => $student2->id,
                'guardian_id' => $guardian->id,
            ],
            [
                'is_primary_payer' => true,
                'status' => GuardianLinkStatus::Verified,
                'verified_at' => Carbon::now(),
            ]
        );

        ConsentRecord::query()->firstOrCreate(
            [
                'student_id' => $student2->id,
                'guardian_id' => $guardian->id,
            ],
            [
                'policy_version' => 'PDPA-2026-v1',
                'consent_scope_json' => ['academic_tutoring' => true, 'analytics' => true],
                'verification_method' => 'otp_sms',
                'ip_address' => '127.0.0.1',
                'consented_at' => Carbon::now(),
            ]
        );

        // 4. Activate Family Subscription for Guardians
        /** @var SubscriptionPlan $familyPlan */
        $familyPlan = SubscriptionPlan::query()->where('tier', 'family')->firstOrFail();

        foreach ([$demoGuardian, $guardian] as $g) {
            $invoiceNo = 'INV-DEMO-'.$g->id.'-'.Carbon::now()->format('Ymd');
            Payment::query()->firstOrCreate(
                ['idempotency_key' => 'IDEMP-DEMO-PAY-'.$g->id],
                [
                    'merchant_invoice_no' => $invoiceNo,
                    'uuid' => (string) Str::uuid(),
                    'guardian_id' => $g->id,
                    'subscription_plan_id' => $familyPlan->id,
                    'gateway' => 'bkash',
                    'amount_bdt' => $familyPlan->price_bdt,
                    'currency' => 'BDT',
                    'status' => 'completed',
                    'gateway_trx_id' => 'TRX-BKASH-DEMO'.$g->id,
                    'webhook_signature_verified' => true,
                    'paid_at' => Carbon::now()->subDays(3),
                ]
            );

            Subscription::query()->firstOrCreate(
                [
                    'guardian_id' => $g->id,
                    'subscription_plan_id' => $familyPlan->id,
                ],
                [
                    'student_id' => null, // family plan covers linked children
                    'status' => 'active',
                    'starts_at' => Carbon::now()->subDays(3),
                    'expires_at' => Carbon::now()->addDays(27),
                    'auto_renew' => true,
                ]
            );
        }

        // 5. Populate Realistic Historical Progress for Student 1 (Rafi)
        /** @var LearningObjective $obj1 */
        $obj1 = LearningObjective::query()->with('topic.chapter.subject.academicClass')->firstOrFail();
        $curriculumVersionId = $obj1->topic->chapter->subject->academicClass->curriculum_version_id;
        $chapter = $obj1->topic->chapter;
        $subject = $chapter->subject;

        // Start real AI tutor session
        /** @var TutorEngineService $tutorService */
        $tutorService = app(TutorEngineService::class);
        $session = $tutorService->startOrResumeSession($student1, $obj1);

        // Advance one turn so continue-lesson is primed
        $tutorService->processTurn(
            session: $session,
            clientTurnId: (string) Str::uuid(),
            studentActionType: 'explain_concept',
            studentInputText: 'আমি বর্গের সূত্র শিখতে প্রস্তুত।',
        );

        // Record real evidence-based mastery
        /** @var MasteryCalculationService $masteryService */
        $masteryService = app(MasteryCalculationService::class);
        $masteryService->recordEvidence(
            studentId: $student1->id,
            curriculumVersionId: $curriculumVersionId,
            learningObjectiveId: $obj1->id,
            sourceType: 'guided_practice',
            sourceId: 101,
            scoreRatio: 0.88,
        );

        $otherObjs = LearningObjective::query()->where('id', '!=', $obj1->id)->with('topic.chapter.subject.academicClass')->limit(2)->get();
        foreach ($otherObjs as $idx => $other) {
            $score = $idx === 0 ? 0.76 : 0.92;
            $masteryService->recordEvidence(
                studentId: $student1->id,
                curriculumVersionId: $other->topic->chapter->subject->academicClass->curriculum_version_id,
                learningObjectiveId: $other->id,
                sourceType: 'guided_practice',
                sourceId: 102 + $idx,
                scoreRatio: $score,
            );
        }

        // Active Study Plan & Items
        /** @var StudyPlan $plan */
        $plan = StudyPlan::query()->firstOrCreate(
            [
                'student_id' => $student1->id,
                'status' => 'active',
            ],
            [
                'curriculum_version_id' => $curriculumVersionId,
                'title' => 'অষ্টম শ্রেণি বার্ষিক চূড়ান্ত প্রস্তুতি প্ল্যান',
                'target_completion_date' => Carbon::today()->addDays(28),
                'daily_study_minutes' => 45,
                'completion_percentage' => 35.00,
                'config_json' => ['focus_subjects' => [$subject->id]],
            ]
        );

        StudyPlanItem::query()->firstOrCreate(
            [
                'study_plan_id' => $plan->id,
                'student_id' => $student1->id,
                'learning_objective_id' => $obj1->id,
                'scheduled_date' => Carbon::today(),
            ],
            [
                'subject_id' => $subject->id,
                'chapter_id' => $chapter->id,
                'topic_id' => $obj1->topic_id,
                'task_type' => 'guided_practice',
                'title_bn' => 'বর্গের সূত্রাবলি অনুশীলন',
                'planned_minutes' => 25,
                'actual_active_minutes' => 20,
                'status' => 'in_progress',
            ]
        );

        if ($otherObjs->isNotEmpty()) {
            $firstOther = $otherObjs->first();
            StudyPlanItem::query()->firstOrCreate(
                [
                    'study_plan_id' => $plan->id,
                    'student_id' => $student1->id,
                    'learning_objective_id' => $firstOther->id,
                    'scheduled_date' => Carbon::today(),
                ],
                [
                    'subject_id' => $firstOther->topic->chapter->subject_id,
                    'chapter_id' => $firstOther->topic->chapter_id,
                    'topic_id' => $firstOther->topic_id,
                    'task_type' => 'concept_review',
                    'title_bn' => $firstOther->title_bn,
                    'planned_minutes' => 20,
                    'actual_active_minutes' => 0,
                    'status' => 'scheduled',
                ]
            );
        }

        // Study Time Logs (today & yesterday)
        StudyTimeLog::query()->firstOrCreate(
            [
                'student_id' => $student1->id,
                'study_date' => Carbon::today()->toDateString(),
                'source_type' => 'tutor_lesson',
                'source_id' => $session->id,
            ],
            [
                'subject_id' => $subject->id,
                'session_start_at' => Carbon::now()->subMinutes(30),
                'last_heartbeat_at' => Carbon::now(),
                'active_seconds' => 1800,
                'paused_seconds' => 60,
                'questions_attempted' => 5,
            ]
        );

        StudyTimeLog::query()->firstOrCreate(
            [
                'student_id' => $student1->id,
                'study_date' => Carbon::yesterday()->toDateString(),
                'source_type' => 'study_plan_practice',
                'source_id' => 101,
            ],
            [
                'subject_id' => $subject->id,
                'session_start_at' => Carbon::yesterday()->setTime(20, 20),
                'last_heartbeat_at' => Carbon::yesterday()->setTime(21, 0),
                'active_seconds' => 2400,
                'paused_seconds' => 120,
                'questions_attempted' => 8,
            ]
        );

        // Real Exam Attempt via Lifecycle
        /** @var Subject $mathSubject */
        $mathSubject = Subject::query()->where('class_id', function ($q): void {
            $q->select('id')->from('classes')->where('grade_level', 8)->limit(1);
        })->first();

        if ($mathSubject !== null) {
            /** @var ExamGeneratorService $examGen */
            $examGen = app(ExamGeneratorService::class);
            /** @var ExamLifecycleService $examLife */
            $examLife = app(ExamLifecycleService::class);

            $exam = $examGen->generateExam(
                subject: $mathSubject,
                examType: 'chapter_quiz',
                titleBn: 'বীজগণিতীয় সূত্রাবলি অধ্যায়ভিত্তিক কুইজ',
                chapterIds: [],
                durationMinutes: 20,
                student: $student1
            );

            $attempt = $examLife->startAttempt($student1, $exam);

            // Answer questions from question blueprint
            $qIds = (array) ($exam->question_blueprint_json['question_ids'] ?? []);
            $answers = [];
            foreach ($qIds as $qId) {
                $answers[] = [
                    'question_id' => (int) $qId,
                    'answer_mode' => 'mcq_choice',
                    'selected_option_key' => 'B',
                    'time_spent_seconds' => 45,
                ];
            }
            if (! empty($answers)) {
                $examLife->autosaveAnswers($attempt, $answers);
                $examLife->submitAttempt($attempt);
            }
        }

        // Award Gamification XP & Streak
        /** @var EthicalGamificationService $gamificationService */
        $gamificationService = app(EthicalGamificationService::class);
        $gamificationService->recordVerifiedAcademicActivity(
            student: $student1,
            sourceType: 'tutor_lesson_completed',
            sourceId: $session->id,
            xpPoints: 35,
            reasonBn: 'বীজগণিতীয় সূত্রাবলি পাঠ সফলভাবে সম্পন্ন',
            activityDate: Carbon::today()->subDays(2)->toDateString()
        );

        $gamificationService->recordVerifiedAcademicActivity(
            student: $student1,
            sourceType: 'daily_study_goal_met',
            sourceId: 201,
            xpPoints: 25,
            reasonBn: 'দৈনিক পড়ার লক্ষ্যমাত্রা পূর্ণ',
            activityDate: Carbon::yesterday()->toDateString()
        );

        $gamificationService->recordVerifiedAcademicActivity(
            student: $student1,
            sourceType: 'exam_completed',
            sourceId: 301,
            xpPoints: 40,
            reasonBn: 'অধ্যায়ভিত্তিক কুইজে ৮৫%+ নম্বর অর্জন',
            activityDate: Carbon::today()->toDateString()
        );
    }
}
