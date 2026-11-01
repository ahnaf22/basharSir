<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\Models\GuardianProfile;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Identity\DTOs\AuthResultData;
use App\Modules\Identity\DTOs\RegisterGuardianData;
use App\Modules\Identity\DTOs\SendOtpData;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

final readonly class RegisterGuardianAction
{
    public function __construct(
        private SendOtpAction $sendOtpAction,
    ) {}

    public function execute(RegisterGuardianData $data): AuthResultData
    {
        $guardianPhone = PhoneNormalizer::normalize($data->phone);

        if (User::query()->where('phone', $guardianPhone)->exists()) {
            throw new DomainException(
                errorCode: 'PHONE_ALREADY_REGISTERED',
                message: 'এই মোবাইল নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।',
                httpStatus: 422,
            );
        }

        if ($data->email !== null && User::query()->where('email', $data->email)->exists()) {
            throw new DomainException(
                errorCode: 'EMAIL_ALREADY_REGISTERED',
                message: 'এই ইমেইল ঠিকানাটি ইতোমধ্যে ব্যবহৃত হয়েছে।',
                httpStatus: 422,
            );
        }

        /** @var AuthResultData $result */
        $result = DB::transaction(function () use ($data, $guardianPhone): AuthResultData {
            $user = User::query()->create([
                'name_en' => $data->nameEn,
                'name_bn' => $data->nameBn,
                'phone' => $guardianPhone,
                'email' => $data->email,
                'password' => $data->password,
                'account_type' => AccountType::Guardian,
                'status' => AccountStatus::Active,
            ]);

            $guardianProfile = GuardianProfile::query()->create([
                'user_id' => $user->id,
                'relation_type' => $data->relationType,
                'preferred_language' => $data->preferredLanguage,
                'weekly_report_channel' => $data->weeklyReportChannel,
            ]);

            $invitedStudents = StudentProfile::query()
                ->where('guardian_phone_invited', $guardianPhone)
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

            $this->sendOtpAction->execute(new SendOtpData(
                phone: $guardianPhone,
                purpose: OtpPurpose::PhoneVerification,
                ipAddress: $data->ipAddress,
            ));

            $user->load(['studentProfile', 'guardianProfile']);
            $token = $user->createToken('guardian-registration')->plainTextToken;

            return new AuthResultData(
                user: $user,
                accessToken: $token,
            );
        });

        return $result;
    }
}
