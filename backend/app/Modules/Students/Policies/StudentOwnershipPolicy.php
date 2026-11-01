<?php

declare(strict_types=1);

namespace App\Modules\Students\Policies;

use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Models\StudentProfile;

final class StudentOwnershipPolicy
{
    public function view(User $user, StudentProfile $student): bool
    {
        if ($user->account_type === AccountType::Admin) {
            return true;
        }

        if ($user->account_type === AccountType::Student) {
            return $user->id === $student->user_id;
        }

        if ($user->account_type === AccountType::Guardian) {
            $user->loadMissing('guardianProfile');
            $guardianProfile = $user->guardianProfile;

            if ($guardianProfile === null) {
                return false;
            }

            return StudentGuardianLink::query()
                ->where('student_id', $student->id)
                ->where('guardian_id', $guardianProfile->id)
                ->where('status', GuardianLinkStatus::Verified->value)
                ->exists();
        }

        return false;
    }

    public function update(User $user, StudentProfile $student): bool
    {
        return $this->view($user, $student);
    }
}
