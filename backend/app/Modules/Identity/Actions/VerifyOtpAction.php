<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Identity\DTOs\VerifyOtpData;
use App\Modules\Identity\Models\OtpVerification;
use Illuminate\Support\Facades\Hash;

final readonly class VerifyOtpAction
{
    private const MAX_ATTEMPTS = 5;

    /**
     * @return array{verified: bool, phone: string, purpose: string, user: User|null, access_token: string|null}
     */
    public function execute(VerifyOtpData $data): array
    {
        $normalizedPhone = PhoneNormalizer::normalize($data->phone);
        $normalizedCode = $this->normalizeDigits($data->code);

        /** @var OtpVerification|null $otpRecord */
        $otpRecord = OtpVerification::query()
            ->where('phone', $normalizedPhone)
            ->where('purpose', $data->purpose->value)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if ($otpRecord === null) {
            throw new DomainException(
                errorCode: 'OTP_NOT_FOUND',
                message: 'কোনো সক্রিয় ওটিপি (OTP) পাওয়া যায়নি। নতুন ওটিপি অনুরোধ করুন।',
                httpStatus: 422,
            );
        }

        if ($otpRecord->expires_at->isPast()) {
            throw new DomainException(
                errorCode: 'OTP_EXPIRED',
                message: 'ওটিপি (OTP) এর মেয়াদ শেষ হয়ে গেছে। নতুন ওটিপি অনুরোধ করুন।',
                httpStatus: 422,
            );
        }

        if ($otpRecord->attempts >= self::MAX_ATTEMPTS) {
            throw new DomainException(
                errorCode: 'OTP_MAX_ATTEMPTS_EXCEEDED',
                message: 'সর্বোচ্চ সংখ্যক ভুল ওটিপি প্রদান করা হয়েছে। নতুন ওটিপি অনুরোধ করুন।',
                httpStatus: 429,
            );
        }

        if (! Hash::check($normalizedCode, $otpRecord->code_hash)) {
            $newAttempts = $otpRecord->attempts + 1;
            $otpRecord->update(['attempts' => $newAttempts]);

            throw new DomainException(
                errorCode: 'INVALID_OTP_CODE',
                message: 'প্রদত্ত ওটিপি (OTP) সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
                httpStatus: 422,
                details: [
                    'remaining_attempts' => max(0, self::MAX_ATTEMPTS - $newAttempts),
                ],
            );
        }

        $otpRecord->update([
            'verified_at' => now(),
        ]);

        /** @var User|null $user */
        $user = User::query()
            ->with(['studentProfile', 'guardianProfile'])
            ->where('phone', $normalizedPhone)
            ->first();

        $accessToken = null;

        if ($user !== null) {
            if ($user->phone_verified_at === null) {
                $user->update(['phone_verified_at' => now()]);
            }

            $accessToken = $user->createToken('otp-verified-token')->plainTextToken;
        }

        return [
            'verified' => true,
            'phone' => $normalizedPhone,
            'purpose' => $data->purpose->value,
            'user' => $user,
            'access_token' => $accessToken,
        ];
    }

    private function normalizeDigits(string $code): string
    {
        $bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        $asciiDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        return str_replace($bengaliDigits, $asciiDigits, trim($code));
    }
}
