<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\DTOs\ApproveConsentData;
use App\Modules\Guardians\Models\ConsentRecord;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

final readonly class ApproveMinorConsentAction
{
    public const POLICY_VERSION = 'PDPA-2026-v1';

    /**
     * @return array{link: StudentGuardianLink, consent_record: ConsentRecord}
     */
    public function execute(User $guardianUser, ApproveConsentData $data): array
    {
        if ($guardianUser->account_type !== AccountType::Guardian) {
            throw new DomainException(
                errorCode: 'FORBIDDEN_GUARDIAN_ONLY',
                message: 'শুধুমাত্র অভিভাবক অ্যাকাউন্ট থেকে PDPA ২০২৬ সম্মতি প্রদান করা যাবে।',
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

        /** @var StudentGuardianLink|null $existingLink */
        $existingLink = StudentGuardianLink::query()
            ->where('student_id', $student->id)
            ->where('guardian_id', $guardianProfile->id)
            ->first();

        if ($existingLink === null && $student->guardian_phone_invited !== $guardianUser->phone) {
            throw new DomainException(
                errorCode: 'UNAUTHORIZED_GUARDIAN_CONSENT',
                message: 'আপনি এই শিক্ষার্থীর অনুমোদিত অভিভাবক নন।',
                httpStatus: 403,
            );
        }

        /** @var array{link: StudentGuardianLink, consent_record: ConsentRecord} $result */
        $result = DB::transaction(function () use ($student, $guardianProfile, $existingLink, $data): array {
            $link = $existingLink ?? new StudentGuardianLink([
                'student_id' => $student->id,
                'guardian_id' => $guardianProfile->id,
                'is_primary_payer' => true,
            ]);

            $link->fill([
                'status' => GuardianLinkStatus::Verified,
                'verified_at' => now(),
            ])->save();

            $consentRecord = ConsentRecord::query()->create([
                'student_id' => $student->id,
                'guardian_id' => $guardianProfile->id,
                'policy_version' => self::POLICY_VERSION,
                'consent_scope_json' => [
                    'ai_tutoring' => $data->aiTutoring,
                    'handwritten_ocr' => $data->handwrittenOcr,
                    'group_study' => $data->groupStudy,
                ],
                'verification_method' => $data->verificationMethod,
                'ip_address' => $data->ipAddress,
                'user_agent' => $data->userAgent !== null ? substr($data->userAgent, 0, 255) : null,
                'consented_at' => now(),
            ]);

            $student->update([
                'consent_status' => ConsentStatus::Verified,
            ]);

            $student->user->update([
                'status' => AccountStatus::Active,
            ]);

            $link->load(['student.user', 'student.consentRecords']);

            return [
                'link' => $link,
                'consent_record' => $consentRecord,
            ];
        });

        return $result;
    }
}
