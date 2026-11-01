<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\DTOs\LinkChildData;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Students\Models\StudentProfile;

final readonly class LinkChildToGuardianAction
{
    public function execute(User $guardianUser, LinkChildData $data): StudentGuardianLink
    {
        if ($guardianUser->account_type !== AccountType::Guardian) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_GUARDIAN_ONLY',
                message: 'শুধুমাত্র অভিভাবক অ্যাকাউন্ট থেকে সন্তান যুক্ত করা যাবে।',
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

        $studentProfile = $this->resolveTargetStudent($data);

        if ($studentProfile->guardian_phone_invited !== $guardianUser->phone) {
            throw new DomainException(
                errorCode: 'UNAUTHORIZED_CHILD_LINK',
                message: 'শিক্ষার্থীর প্রদত্ত অভিভাবক মোবাইল নম্বরের সাথে আপনার নম্বরটি মেলেনি।',
                httpStatus: 403,
            );
        }

        /** @var StudentGuardianLink $link */
        $link = StudentGuardianLink::query()->firstOrCreate(
            [
                'student_id' => $studentProfile->id,
                'guardian_id' => $guardianProfile->id,
            ],
            [
                'is_primary_payer' => $data->isPrimaryPayer,
                'status' => GuardianLinkStatus::Invited,
            ],
        );

        $link->load(['student.user', 'student.consentRecords']);

        return $link;
    }

    private function resolveTargetStudent(LinkChildData $data): StudentProfile
    {
        if ($data->studentCode !== null && $data->studentCode !== '') {
            /** @var StudentProfile|null $byCode */
            $byCode = StudentProfile::query()
                ->with('user')
                ->where('student_code', trim($data->studentCode))
                ->first();

            if ($byCode !== null) {
                return $byCode;
            }
        }

        if ($data->studentPhone !== null && $data->studentPhone !== '') {
            $normalizedPhone = PhoneNormalizer::normalize($data->studentPhone);

            /** @var StudentProfile|null $byPhone */
            $byPhone = StudentProfile::query()
                ->with('user')
                ->whereHas('user', static function ($query) use ($normalizedPhone): void {
                    $query->where('phone', $normalizedPhone);
                })
                ->first();

            if ($byPhone !== null) {
                return $byPhone;
            }
        }

        throw new DomainException(
            errorCode: 'STUDENT_NOT_FOUND',
            message: 'প্রদত্ত শিক্ষার্থী কোড বা মোবাইল নম্বরে কোনো শিক্ষার্থী পাওয়া যায়নি।',
            httpStatus: 404,
        );
    }
}
