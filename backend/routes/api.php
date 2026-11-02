<?php

declare(strict_types=1);

use App\Core\Http\Controllers\V1\HealthCheckController;
use App\Modules\AcademicContent\Controllers\V1\LearningResourceController;
use App\Modules\Curriculum\Controllers\V1\CurriculumController;
use App\Modules\Evaluation\Controllers\PhaseFiveController;
use App\Modules\Examinations\Controllers\ExaminationController;
use App\Modules\GroupLearning\Controllers\GroupLearningController;
use App\Modules\Guardians\Controllers\V1\GuardianConsentController;
use App\Modules\Identity\Controllers\V1\AuthController;
use App\Modules\LearningAnalytics\Controllers\LearningAnalyticsController;
use App\Modules\Students\Controllers\V1\StudentProfileController;
use App\Modules\StudyPlanner\Controllers\StudyPlanAndCalendarController;
use App\Modules\Subscriptions\Controllers\SubscriptionAndPaymentController;
use App\Modules\TeacherMarketplace\Controllers\TeacherMarketplaceController;
use App\Modules\Tutoring\Controllers\TutorSessionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::get('/health', HealthCheckController::class)->name('health');
    Route::get('/subscriptions/plans', [SubscriptionAndPaymentController::class, 'listPlans'])->name('subscriptions.plans');
    Route::post('/webhooks/payments/{gateway}', [SubscriptionAndPaymentController::class, 'handleWebhook'])->name('webhooks.payments');

    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('/register/student', [AuthController::class, 'registerStudent'])->name('register.student');
        Route::post('/register/guardian', [AuthController::class, 'registerGuardian'])->name('register.guardian');
        Route::post('/otp/send', [AuthController::class, 'sendOtp'])->name('otp.send');
        Route::post('/otp/verify', [AuthController::class, 'verifyOtp'])->name('otp.verify');
        Route::post('/login', [AuthController::class, 'login'])->name('login');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

    Route::middleware('auth:sanctum')->prefix('students')->name('students.')->group(function (): void {
        Route::get('/me', [StudentProfileController::class, 'showMe'])->name('me.show');
        Route::patch('/me', [StudentProfileController::class, 'updateMe'])->name('me.update');
        Route::get('/me/dashboard', [StudentProfileController::class, 'dashboard'])->name('me.dashboard');
        Route::get('/me/exam-attempts', [ExaminationController::class, 'myAttempts'])->name('me.exam-attempts');
        Route::get('/me/consent-gate', [StudentProfileController::class, 'verifyConsentedAccess'])
            ->middleware('consent.verified')
            ->name('me.consent-gate');
        Route::get('/{studentCode}', [StudentProfileController::class, 'showByCode'])->name('show.by-code');
    });

    Route::middleware('auth:sanctum')->prefix('guardians')->name('guardians.')->group(function (): void {
        Route::get('/children', [GuardianConsentController::class, 'listChildren'])->name('children.index');
        Route::post('/children/link', [GuardianConsentController::class, 'linkChild'])->name('children.link');
        Route::post('/consent/approve', [GuardianConsentController::class, 'approveConsent'])->name('consent.approve');
        Route::post('/consent/revoke', [GuardianConsentController::class, 'revokeConsent'])->name('consent.revoke');
        Route::post('/consent/withdraw', [GuardianConsentController::class, 'revokeConsent'])->name('consent.withdraw');
        Route::get('/children/{studentCode}/weekly-report', [LearningAnalyticsController::class, 'guardianChildWeeklyReport'])
            ->name('children.weekly-report');
        Route::get('/children/{studentCode}/weekly-report/pdf', [LearningAnalyticsController::class, 'downloadGuardianWeeklyReportPdf'])
            ->name('children.weekly-report.pdf');
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/curriculum/active', [CurriculumController::class, 'activeCurriculum'])->name('curriculum.active');
        Route::get('/curriculum/my-subjects', [CurriculumController::class, 'mySubjects'])->name('curriculum.my-subjects');
        Route::get('/subjects', [CurriculumController::class, 'listSubjects'])->name('subjects.index');
        Route::get('/subjects/{subject}/chapters', [CurriculumController::class, 'listChapters'])->name('subjects.chapters');
        Route::get('/chapters/{chapter}/topics', [CurriculumController::class, 'listTopics'])->name('chapters.topics');
        Route::post('/curriculum/objectives/{objective}/prerequisites', [CurriculumController::class, 'addPrerequisite'])
            ->name('curriculum.objectives.prerequisites.store');

        Route::get('/chapters/{chapter}/resources', [LearningResourceController::class, 'listChapterResources'])
            ->name('chapters.resources.index');
        Route::post('/resources', [LearningResourceController::class, 'store'])
            ->name('resources.store');
        Route::post('/resources/{resource}/workflow', [LearningResourceController::class, 'transitionWorkflow'])
            ->name('resources.workflow.transition');
        Route::get('/resources/{resource}/pdf', [LearningResourceController::class, 'downloadWatermarkedPdf'])
            ->name('resources.pdf');
        Route::put('/resources/{resource}/annotations', [LearningResourceController::class, 'saveAnnotation'])
            ->name('resources.annotations.save');
        Route::get('/curriculum/objectives/{learningObjectiveId}/rag-chunks', [LearningResourceController::class, 'searchObjectiveRagChunks'])
            ->name('curriculum.objectives.rag-chunks');

        Route::middleware('consent.verified')->prefix('tutor-sessions')->name('tutor-sessions.')->group(function (): void {
            Route::post('/', [TutorSessionController::class, 'start'])->name('start');
            Route::get('/{session}', [TutorSessionController::class, 'show'])->name('show');
            Route::post('/{session}/turns', [TutorSessionController::class, 'submitTurn'])
                ->middleware('quota.check:ai_tutor')
                ->name('turns.submit');
            Route::post('/{session}/pause', [TutorSessionController::class, 'pause'])->name('pause');
            Route::post('/{session}/flag', [TutorSessionController::class, 'flagMessage'])->name('flag');
        });

        Route::get('/me/entitlements', [SubscriptionAndPaymentController::class, 'myEntitlements'])->name('me.entitlements');
        Route::get('/subscriptions/status', [SubscriptionAndPaymentController::class, 'status'])->name('subscriptions.status');
        Route::post('/payments/checkout', [SubscriptionAndPaymentController::class, 'initiateCheckout'])->name('payments.checkout');
        Route::post('/payments/{payment:uuid}/sandbox-confirm', [SubscriptionAndPaymentController::class, 'sandboxConfirmPayment'])->name('payments.sandbox-confirm');

        Route::get('/teachers', [TeacherMarketplaceController::class, 'listVerifiedTeachers'])->name('teachers.index');
        Route::post('/teachers/register', [TeacherMarketplaceController::class, 'registerTeacherProfile'])->name('teachers.register');
        Route::post('/teachers/{teacher}/verify', [TeacherMarketplaceController::class, 'verifyTeacherVetting'])->name('teachers.verify');
        Route::post('/teacher-bookings', [TeacherMarketplaceController::class, 'bookSession'])->name('teacher-bookings.store');
        Route::post('/script-review-assignments', [TeacherMarketplaceController::class, 'assignScriptReview'])->name('script-reviews.assign');
        Route::post('/script-review-assignments/{assignment}/complete', [TeacherMarketplaceController::class, 'completeScriptReview'])->name('script-reviews.complete');
        Route::get('/curriculum/classes-1-to-10', [TeacherMarketplaceController::class, 'listClassesOneToTen'])->name('curriculum.classes-1-to-10');

        Route::middleware('consent.verified')->group(function (): void {
            Route::post('/study-plans', [StudyPlanAndCalendarController::class, 'store'])->name('study-plans.store');
            Route::get('/study-plans/active', [StudyPlanAndCalendarController::class, 'activePlan'])->name('study-plans.active');
            Route::post('/study-plans/{studyPlan}/rebalance', [StudyPlanAndCalendarController::class, 'rebalance'])->name('study-plans.rebalance');
            Route::patch('/study-plan-items/{item}/reschedule', [StudyPlanAndCalendarController::class, 'rescheduleItem'])->name('study-plan-items.reschedule');
            Route::get('/calendar', [StudyPlanAndCalendarController::class, 'calendar'])->name('calendar.index');
            Route::post('/analytics/study-heartbeat', [StudyPlanAndCalendarController::class, 'ingestHeartbeat'])->name('analytics.study-heartbeat');

            Route::post('/exams/generate', [ExaminationController::class, 'generateAndStart'])
                ->middleware('quota.check:exam')
                ->name('exams.generate');
            Route::get('/exam-attempts/{attempt}', [ExaminationController::class, 'showAttempt'])->name('exam-attempts.show');
            Route::put('/exam-attempts/{attempt}/answers', [ExaminationController::class, 'saveAnswers'])->name('exam-attempts.answers.save');
            Route::post('/exam-attempts/{attempt}/submit', [ExaminationController::class, 'submitAttempt'])->name('exam-attempts.submit');

            Route::get('/analytics/me', [LearningAnalyticsController::class, 'myAnalytics'])->name('analytics.me');

            Route::post('/script-uploads', [PhaseFiveController::class, 'uploadScript'])->name('script-uploads.store');
            Route::post('/script-uploads/{scriptUpload}/review-override', [PhaseFiveController::class, 'overrideScriptReview'])->name('script-uploads.override');

            Route::get('/group-sessions', [GroupLearningController::class, 'index'])->name('group-sessions.index');
            Route::post('/group-sessions', [GroupLearningController::class, 'store'])->name('group-sessions.store');
            Route::get('/group-sessions/{groupSession}', [GroupLearningController::class, 'show'])->name('group-sessions.show');
            Route::post('/group-sessions/{groupSession}/join', [GroupLearningController::class, 'join'])->name('group-sessions.join');
            Route::post('/group-sessions/{groupSession}/broadcast-questions', [GroupLearningController::class, 'createBroadcastQuestion'])
                ->name('group-sessions.broadcast-questions.store');
            Route::post('/group-sessions/{groupSession}/broadcast-questions/{question}/respond', [GroupLearningController::class, 'respondBroadcastQuestion'])
                ->name('group-sessions.broadcast-questions.respond');
            Route::post('/group-sessions/{groupSession}/individual-assistance', [GroupLearningController::class, 'requestIndividualAssistance'])
                ->name('group-sessions.individual-assistance');
            Route::post('/group-sessions/{groupSession}/participants/{participant}/moderate', [GroupLearningController::class, 'moderateParticipant'])
                ->name('group-sessions.participants.moderate');
            Route::post('/group-sessions/{groupSession}/raise-hand', [PhaseFiveController::class, 'raiseHand'])->name('group-sessions.raise-hand');
            Route::post('/group-sessions/{groupSession}/resolve-next', [PhaseFiveController::class, 'resolveNextRaiseHand'])->name('group-sessions.resolve-next');

            Route::get('/gamification/me', [PhaseFiveController::class, 'myGamification'])->name('gamification.me');
            Route::post('/gamification/events', [PhaseFiveController::class, 'recordGamificationEvent'])->name('gamification.events');
            Route::get('/gamification/leaderboard', [PhaseFiveController::class, 'cohortLeaderboard'])->name('gamification.leaderboard');
        });
    });
});
