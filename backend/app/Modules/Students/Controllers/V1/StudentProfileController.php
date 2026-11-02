<?php

declare(strict_types=1);

namespace App\Modules\Students\Controllers\V1;

use App\Core\Exceptions\DomainException;
use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Examinations\Models\Exam;
use App\Modules\Gamification\Domain\Models\StudentBadge;
use App\Modules\Gamification\Domain\Models\StudentStreak;
use App\Modules\Gamification\Domain\Models\XpLedger;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Resources\UserResource;
use App\Modules\LearningAnalytics\Models\MasteryRecord;
use App\Modules\LearningAnalytics\Models\StudyTimeLog;
use App\Modules\Students\Actions\UpdateStudentProfileAction;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Students\Requests\UpdateStudentProfileRequest;
use App\Modules\StudyPlanner\Models\StudyPlan;
use App\Modules\StudyPlanner\Models\StudyPlanItem;
use App\Modules\Tutoring\Models\TutorSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

final class StudentProfileController extends Controller
{
    public function showMe(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->account_type !== AccountType::Student) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_STUDENT_ENDPOINT',
                message: 'শুধুমাত্র শিক্ষার্থী অ্যাকাউন্ট থেকে এই প্রোফাইল দেখা যাবে।',
                httpStatus: 403,
            );
        }

        $user->load(['studentProfile', 'guardianProfile']);

        return ApiResponse::success(
            data: (new UserResource($user))->resolve($request),
            message: 'শিক্ষার্থী প্রোফাইল সফলভাবে লোড হয়েছে।',
        );
    }

    public function updateMe(
        UpdateStudentProfileRequest $request,
        UpdateStudentProfileAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $updatedUser = $action->execute($user, $request->toDto());

        return ApiResponse::success(
            data: (new UserResource($updatedUser))->resolve($request),
            message: 'শিক্ষার্থী প্রোফাইল সফলভাবে হালনাগাদ করা হয়েছে।',
        );
    }

    public function showByCode(Request $request, string $studentCode): JsonResponse
    {
        /** @var StudentProfile|null $student */
        $student = StudentProfile::query()
            ->with('user')
            ->where('student_code', $studentCode)
            ->first();

        if ($student === null) {
            throw new DomainException(
                errorCode: 'STUDENT_NOT_FOUND',
                message: 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        Gate::authorize('view', $student);

        $studentUser = $student->user;
        $studentUser->setRelation('studentProfile', $student);

        return ApiResponse::success(
            data: (new UserResource($studentUser))->resolve($request),
            message: 'শিক্ষার্থী প্রোফাইল সফলভাবে লোড হয়েছে।',
        );
    }

    public function verifyConsentedAccess(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->loadMissing('studentProfile');

        return ApiResponse::success(
            data: [
                'consent_verified' => true,
                'student_code' => $user->studentProfile?->student_code,
                'consent_status' => $user->studentProfile?->consent_status->value,
            ],
            message: 'অভিভাবকের সম্মতি (PDPA ২০২৬) যাচাইকৃত রয়েছে।',
        );
    }

    public function dashboard(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->studentProfile ?? StudentProfile::query()->where('user_id', $user->id)->first();

        if ($student === null) {
            throw new DomainException(
                errorCode: 'STUDENT_NOT_FOUND',
                message: 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        // 1. Today's study plan tasks
        $activePlan = StudyPlan::query()
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        $todayTasks = [];
        if ($activePlan !== null) {
            $todayItems = StudyPlanItem::query()
                ->with(['subject', 'learningObjective.topic.chapter.subject'])
                ->where('study_plan_id', $activePlan->id)
                ->whereDate('scheduled_date', Carbon::today())
                ->orderBy('id')
                ->get();

            foreach ($todayItems as $item) {
                $todayTasks[] = [
                    'id' => $item->id,
                    'title_bn' => $item->title_bn,
                    'subject_title_bn' => $item->subject->title_bn,
                    'estimated_minutes' => $item->planned_minutes,
                    'status' => $item->status,
                    'learning_objective_id' => $item->learning_objective_id,
                ];
            }
        }

        // 2. Continue lesson
        /** @var TutorSession|null $recentSession */
        $recentSession = TutorSession::query()
            ->with(['activeObjective.topic.chapter.subject'])
            ->where('student_id', $student->id)
            ->whereIn('session_status', ['active', 'paused'])
            ->orderByDesc('updated_at')
            ->first();

        $continueLesson = null;
        if ($recentSession !== null) {
            $continueLesson = [
                'session_id' => $recentSession->id,
                'session_uuid' => $recentSession->uuid,
                'current_stage' => $recentSession->current_stage,
                'title_bn' => $recentSession->activeObjective->title_bn,
                'chapter_title_bn' => $recentSession->activeObjective->topic->chapter->title_bn,
                'subject_title_bn' => $recentSession->activeObjective->topic->chapter->subject->title_bn,
                'active_duration_seconds' => $recentSession->active_duration_seconds,
            ];
        }

        // 3. Streak, XP, Badges
        $streak = StudentStreak::query()->where('student_id', $student->id)->first();
        $totalXp = (int) XpLedger::query()->where('student_id', $student->id)->sum('xp_points');
        $badges = StudentBadge::query()
            ->where('student_id', $student->id)
            ->orderByDesc('awarded_at')
            ->limit(5)
            ->get();

        // 4. Study time today
        $todayStudySeconds = (int) StudyTimeLog::query()
            ->where('student_id', $student->id)
            ->whereDate('study_date', Carbon::today())
            ->sum('active_seconds');

        // 5. Subject Mastery Matrix
        $academicClass = AcademicClass::query()
            ->where('grade_level', $student->current_class_level)
            ->first();

        $subjectMastery = [];
        if ($academicClass !== null) {
            $subjects = Subject::query()
                ->where('class_id', $academicClass->id)
                ->with(['chapters.topics.learningObjectives'])
                ->get();

            foreach ($subjects as $subj) {
                $objIds = $subj->chapters
                    ->flatMap(fn ($ch) => $ch->topics)
                    ->flatMap(fn ($tp) => $tp->learningObjectives)
                    ->pluck('id')
                    ->all();

                $avgMastery = 0.0;
                $masteredCount = 0;
                if (! empty($objIds)) {
                    $records = MasteryRecord::query()
                        ->where('student_id', $student->id)
                        ->whereIn('learning_objective_id', $objIds)
                        ->get();

                    if ($records->isNotEmpty()) {
                        $avgMastery = round((float) $records->avg('mastery_score'), 1);
                        $masteredCount = $records->where('mastery_score', '>=', 75.0)->count();
                    }
                }

                $subjectMastery[] = [
                    'id' => $subj->id,
                    'title_bn' => $subj->title_bn,
                    'title_en' => $subj->title_en,
                    'subject_code' => $subj->nctb_subject_code,
                    'mastery_pct' => $avgMastery,
                    'total_chapters' => $subj->chapters->count(),
                    'total_objectives' => count($objIds),
                    'mastered_objectives' => $masteredCount,
                ];
            }
        }

        // 6. Upcoming published exams
        $upcomingExams = [];
        if ($academicClass !== null) {
            $exams = Exam::query()
                ->with('subject')
                ->whereHas('subject', function ($q) use ($academicClass): void {
                    $q->where('class_id', $academicClass->id);
                })
                ->latest('id')
                ->limit(4)
                ->get();

            foreach ($exams as $ex) {
                $upcomingExams[] = [
                    'id' => $ex->id,
                    'title_bn' => $ex->title_bn,
                    'subject_title_bn' => $ex->subject->title_bn,
                    'exam_type' => $ex->exam_type,
                    'duration_minutes' => $ex->duration_minutes,
                    'total_marks' => $ex->total_marks,
                ];
            }
        }

        return ApiResponse::success(
            data: [
                'student' => [
                    'student_code' => $student->student_code,
                    'name_bn' => $user->name_bn,
                    'name_en' => $user->name_en,
                    'current_class_level' => $student->current_class_level,
                    'medium' => $student->medium->value,
                    'daily_study_target_mins' => $student->daily_study_target_mins,
                ],
                'continue_lesson' => $continueLesson,
                'today_tasks' => $todayTasks,
                'streak' => [
                    'current_days' => $streak !== null ? $streak->current_streak_days : 0,
                    'longest_days' => $streak !== null ? $streak->longest_streak_days : 0,
                    'freezes_available' => $streak !== null ? $streak->streak_freezes_available : 1,
                    'last_active_date' => $streak?->last_active_date?->format('Y-m-d'),
                ],
                'gamification' => [
                    'total_xp' => $totalXp,
                    'badges_count' => $badges->count(),
                    'badges' => $badges,
                ],
                'today_study_time' => [
                    'active_seconds' => $todayStudySeconds,
                    'active_minutes' => round($todayStudySeconds / 60, 1),
                    'target_minutes' => $student->daily_study_target_mins,
                ],
                'subject_mastery' => $subjectMastery,
                'upcoming_exams' => $upcomingExams,
            ],
            message: 'শিক্ষার্থীর হোম ড্যাশবোর্ড সফলভাবে লোড হয়েছে।',
        );
    }
}
