<?php

declare(strict_types=1);

namespace App\Modules\Students\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Students\DTOs\UpdateStudentProfileData;
use Illuminate\Support\Facades\DB;

final readonly class UpdateStudentProfileAction
{
    public function execute(User $user, UpdateStudentProfileData $data): User
    {
        $user->loadMissing('studentProfile');
        $profile = $user->studentProfile;

        if ($profile === null) {
            throw new DomainException(
                errorCode: 'STUDENT_PROFILE_NOT_FOUND',
                message: 'শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        DB::transaction(function () use ($user, $profile, $data): void {
            $userUpdates = array_filter([
                'name_bn' => $data->nameBn,
                'name_en' => $data->nameEn,
            ], static fn (mixed $value): bool => $value !== null);

            if ($userUpdates !== []) {
                $user->update($userUpdates);
            }

            $profileUpdates = array_filter([
                'current_class_level' => $data->currentClassLevel,
                'medium' => $data->medium,
                'school_name' => $data->schoolName,
                'district' => $data->district,
                'daily_study_target_mins' => $data->dailyStudyTargetMins,
                'pseudonym' => $data->pseudonym,
            ], static fn (mixed $value): bool => $value !== null);

            if ($profileUpdates !== []) {
                $profile->update($profileUpdates);
            }
        });

        return $user->fresh(['studentProfile', 'guardianProfile']) ?? $user;
    }
}
