<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Identity\DTOs\AuthResultData;
use App\Modules\Identity\DTOs\RegisterStudentData;
use App\Modules\Identity\DTOs\SendOtpData;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

final readonly class RegisterStudentAction
{
    public function __construct(
        private SendOtpAction $sendOtpAction,
    ) {}

    public function execute(RegisterStudentData $data): AuthResultData
    {
        $studentPhone = PhoneNormalizer::normalize($data->phone);
        $guardianPhone = PhoneNormalizer::normalize($data->guardianPhone);

        if (User::query()->where('phone', $studentPhone)->exists()) {
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
        $result = DB::transaction(function () use ($data, $studentPhone, $guardianPhone): AuthResultData {
            $user = User::query()->create([
                'name_en' => $data->nameEn,
                'name_bn' => $data->nameBn,
                'phone' => $studentPhone,
                'email' => $data->email,
                'password' => $data->password,
                'account_type' => AccountType::Student,
                'status' => AccountStatus::PendingConsent,
            ]);

            $studentProfile = StudentProfile::query()->create([
                'user_id' => $user->id,
                'student_code' => $this->generateUniqueStudentCode(),
                'current_class_level' => $data->currentClassLevel,
                'medium' => $data->medium,
                'school_name' => $data->schoolName,
                'district' => $data->district,
                'date_of_birth' => $data->dateOfBirth,
                'consent_status' => ConsentStatus::Pending,
                'daily_study_target_mins' => 60,
                'guardian_phone_invited' => $guardianPhone,
            ]);

            /** @var User|null $existingGuardianUser */
            $existingGuardianUser = User::query()
                ->with('guardianProfile')
                ->where('phone', $guardianPhone)
                ->where('account_type', AccountType::Guardian->value)
                ->first();

            if ($existingGuardianUser?->guardianProfile !== null) {
                StudentGuardianLink::query()->firstOrCreate(
                    [
                        'student_id' => $studentProfile->id,
                        'guardian_id' => $existingGuardianUser->guardianProfile->id,
                    ],
                    [
                        'is_primary_payer' => true,
                        'status' => GuardianLinkStatus::Invited,
                    ],
                );
            }

            $this->sendOtpAction->execute(new SendOtpData(
                phone: $studentPhone,
                purpose: OtpPurpose::PhoneVerification,
                ipAddress: $data->ipAddress,
            ));

            if ($guardianPhone !== $studentPhone) {
                $this->sendOtpAction->execute(new SendOtpData(
                    phone: $guardianPhone,
                    purpose: OtpPurpose::GuardianConsent,
                    ipAddress: $data->ipAddress,
                ));
            }

            $user->load(['studentProfile', 'guardianProfile']);
            $token = $user->createToken('student-registration')->plainTextToken;

            return new AuthResultData(
                user: $user,
                accessToken: $token,
            );
        });

        return $result;
    }

    private function generateUniqueStudentCode(): string
    {
        $year = now()->format('Y');

        do {
            $code = sprintf('STD-%s-%06d', $year, random_int(1, 999999));
        } while (StudentProfile::query()->where('student_code', $code)->exists());

        return $code;
    }
}
