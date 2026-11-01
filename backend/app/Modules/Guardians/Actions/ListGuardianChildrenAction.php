<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;

final readonly class ListGuardianChildrenAction
{
    /**
     * @return Collection<int, StudentGuardianLink>
     */
    public function execute(User $guardianUser): Collection
    {
        if ($guardianUser->account_type !== AccountType::Guardian) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_GUARDIAN_ONLY',
                message: 'শুধুমাত্র অভিভাবক অ্যাকাউন্ট থেকে সন্তানের তালিকা দেখা যাবে।',
                httpStatus: 403,
            );
        }

        $guardianUser->loadMissing('guardianProfile');
        $guardianProfile = $guardianUser->guardianProfile;

        if ($guardianProfile === null) {
            throw new DomainException(
                errorCode: 'GUARDIAN_PROFILE_NOT_FOUND',
                message: 'অভিভাবক প্রোফাইল পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        $invitedStudents = StudentProfile::query()
            ->where('guardian_phone_invited', $guardianUser->phone)
            ->get();

        foreach ($invitedStudents as $invitedStudent) {
            StudentGuardianLink::query()->firstOrCreate(
                [
                    'student_id' => $invitedStudent->id,
                    'guardian_id' => $guardianProfile->id,
                ],
                [
                    'is_primary_payer' => true,
                    'status' => GuardianLinkStatus::Invited,
                ],
            );
        }

        return StudentGuardianLink::query()
            ->with(['student.user', 'student.consentRecords'])
            ->where('guardian_id', $guardianProfile->id)
            ->orderByDesc('id')
            ->get();
    }
}
