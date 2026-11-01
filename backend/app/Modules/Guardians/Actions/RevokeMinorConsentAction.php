<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\DTOs\RevokeConsentData;
use App\Modules\Guardians\Models\ConsentRecord;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

final readonly class RevokeMinorConsentAction
{
    public function execute(User $guardianUser, RevokeConsentData $data): StudentGuardianLink
    {
        if ($guardianUser->account_type !== AccountType::Guardian) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_GUARDIAN_ONLY',
                message: 'শুধুমাত্র অভিভাবক অ্যাকাউন্ট থেকে সম্মতি প্রত্যাহার করা যাবে।',
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

        /** @var StudentProfile|null $student */
        $student = StudentProfile::query()
            ->with('user')
            ->where('student_code', trim($data->studentCode))
            ->first();

        if ($student === null) {
            throw new DomainException(
                errorCode: 'STUDENT_NOT_FOUND',
                message: 'শিক্ষার্থী খুঁজে পাওয়া যায়নি।',
                httpStatus: 404,
            );
        }

        /** @var StudentGuardianLink|null $link */
        $link = StudentGuardianLink::query()
            ->where('student_id', $student->id)
            ->where('guardian_id', $guardianProfile->id)
            ->first();

        if ($link === null) {
            throw new DomainException(
                errorCode: 'UNAUTHORIZED_GUARDIAN_CONSENT',
                message: 'আপনি এই শিক্ষার্থীর অনুমোদিত অভিভাবক নন।',
                httpStatus: 403,
            );
        }

        /** @var StudentGuardianLink $updatedLink */
        $updatedLink = DB::transaction(function () use ($student, $guardianProfile, $link): StudentGuardianLink {
            ConsentRecord::query()
                ->where('student_id', $student->id)
                ->where('guardian_id', $guardianProfile->id)
                ->whereNull('withdrawn_at')
                ->update([
                    'withdrawn_at' => now(),
                ]);

            $link->update([
                'status' => GuardianLinkStatus::Revoked,
            ]);

            $student->update([
                'consent_status' => ConsentStatus::Withdrawn,
            ]);

            $student->user->update([
                'status' => AccountStatus::PendingConsent,
            ]);

            $link->load(['student.user', 'student.consentRecords']);

            return $link;
        });

        return $updatedLink;
    }
}
