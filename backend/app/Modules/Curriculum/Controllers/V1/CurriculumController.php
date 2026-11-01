<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Controllers\V1;

use App\Core\Exceptions\DomainException;
use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Curriculum\Actions\AddObjectivePrerequisiteAction;
use App\Modules\Curriculum\Domain\Enums\CurriculumVersionStatus;
use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\Chapter;
use App\Modules\Curriculum\Models\CurriculumVersion;
use App\Modules\Curriculum\Models\LearningObjective;
use App\Modules\Curriculum\Models\Subject;
use App\Modules\Curriculum\Requests\AddObjectivePrerequisiteRequest;
use App\Modules\Curriculum\Resources\ChapterResource;
use App\Modules\Curriculum\Resources\CurriculumVersionResource;
use App\Modules\Curriculum\Resources\SubjectResource;
use App\Modules\Curriculum\Resources\TopicResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CurriculumController extends Controller
{
    public function activeCurriculum(Request $request): JsonResponse
    {
        /** @var CurriculumVersion|null $version */
        $version = CurriculumVersion::query()
            ->with(['academicYear', 'classes'])
            ->where('status', CurriculumVersionStatus::Published->value)
            ->orderByDesc('effective_from')
            ->first();

        if ($version === null) {
            throw new DomainException(
                errorCode: 'ACTIVE_CURRICULUM_NOT_FOUND',
                message: 'কোনো সক্রিয় প্রকাশিত পাঠ্যক্রম সংস্করণ পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        return ApiResponse::success(
            data: (new CurriculumVersionResource($version))->resolve($request),
            message: 'সক্রিয় এনসিটিবি (NCTB) পাঠ্যক্রম সংস্করণ সফলভাবে লোড হয়েছে।',
        );
    }

    public function listSubjects(Request $request): JsonResponse
    {
        $gradeLevelParam = $request->query('grade_level');
        $gradeLevel = is_numeric($gradeLevelParam) ? (int) $gradeLevelParam : null;

        if ($gradeLevel === null) {
            $user = $request->user();
            if ($user instanceof User) {
                $user->loadMissing('studentProfile');
                $gradeLevel = $user->studentProfile?->current_class_level;
            }
        }

        $gradeLevel ??= 8;

        /** @var CurriculumVersion|null $version */
        $version = CurriculumVersion::query()
            ->where('status', CurriculumVersionStatus::Published->value)
            ->orderByDesc('effective_from')
            ->first();

        if ($version === null) {
            throw new DomainException(
                errorCode: 'ACTIVE_CURRICULUM_NOT_FOUND',
                message: 'কোনো সক্রিয় প্রকাশিত পাঠ্যক্রম সংস্করণ পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        /** @var AcademicClass|null $academicClass */
        $academicClass = AcademicClass::query()
            ->with(['subjects'])
            ->where('curriculum_version_id', $version->id)
            ->where('grade_level', $gradeLevel)
            ->first();

        if ($academicClass === null) {
            throw new DomainException(
                errorCode: 'CLASS_NOT_FOUND',
                message: 'নির্ধারিত শ্রেণির পাঠ্যক্রম পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        return ApiResponse::success(
            data: [
                'curriculum_version_code' => $version->version_code,
                'grade_level' => $academicClass->grade_level,
                'class_title_bn' => $academicClass->title_bn,
                'subjects' => SubjectResource::collection($academicClass->subjects)->resolve($request),
            ],
            message: 'শ্রেণির বিষয়সমূহ সফলভাবে লোড হয়েছে।',
        );
    }

    public function listChapters(Request $request, Subject $subject): JsonResponse
    {
        $subject->load(['chapters']);

        return ApiResponse::success(
            data: [
                'subject' => (new SubjectResource($subject))->resolve($request),
                'chapters' => ChapterResource::collection($subject->chapters)->resolve($request),
            ],
            message: 'বিষয়ের অধ্যায়সমূহ সফলভাবে লোড হয়েছে।',
        );
    }

    public function listTopics(Request $request, Chapter $chapter): JsonResponse
    {
        $chapter->load(['topics.learningObjectives.prerequisites']);

        return ApiResponse::success(
            data: [
                'chapter' => [
                    'id' => $chapter->id,
                    'chapter_number' => $chapter->chapter_number,
                    'title_bn' => $chapter->title_bn,
                    'title_en' => $chapter->title_en,
                    'syllabus_status' => $chapter->syllabus_status,
                ],
                'topics' => TopicResource::collection($chapter->topics)->resolve($request),
            ],
            message: 'অধ্যায়ের টপিক, শিখনফল ও পূর্বশর্ত গ্রাফ সফলভাবে লোড হয়েছে।',
        );
    }

    public function addPrerequisite(
        AddObjectivePrerequisiteRequest $request,
        LearningObjective $objective,
        AddObjectivePrerequisiteAction $action,
    ): JsonResponse {
        $prerequisiteId = (int) $request->validated('prerequisite_objective_id');
        $isStrictRaw = $request->validated('is_strict');
        $isStrict = $isStrictRaw !== null ? (bool) $isStrictRaw : true;

        $edge = $action->execute($objective, $prerequisiteId, $isStrict);

        return ApiResponse::success(
            data: [
                'id' => $edge->id,
                'learning_objective_id' => $edge->learning_objective_id,
                'prerequisite_objective_id' => $edge->prerequisite_objective_id,
                'is_strict' => $edge->is_strict,
            ],
            message: 'শিখনফলের পূর্বশর্ত সফলভাবে সংযুক্ত করা হয়েছে।',
            status: 201,
        );
    }
}
