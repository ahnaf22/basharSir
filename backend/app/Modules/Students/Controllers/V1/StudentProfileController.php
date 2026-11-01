<?php

declare(strict_types=1);

namespace App\Modules\Students\Controllers\V1;

use App\Core\Exceptions\DomainException;
use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Resources\UserResource;
use App\Modules\Students\Actions\UpdateStudentProfileAction;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Students\Requests\UpdateStudentProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
}
