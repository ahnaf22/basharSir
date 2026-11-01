<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Core\Exceptions\DomainException;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Identity\DTOs\SendOtpData;
use App\Modules\Identity\Models\OtpVerification;
use App\Modules\Notifications\Contracts\SmsGatewayInterface;
use Illuminate\Support\Facades\Hash;

final readonly class SendOtpAction
{
    private const MAX_SENDS_PER_WINDOW = 3;

    private const WINDOW_MINUTES = 5;

    private const EXPIRY_MINUTES = 5;

    public function __construct(
        private SmsGatewayInterface $smsGateway,
    ) {}

    /**
     * @return array{phone_masked: string, purpose: string, expires_in_seconds: int, provider_message_id: string}
     */
    public function execute(SendOtpData $data): array
    {
        $normalizedPhone = PhoneNormalizer::normalize($data->phone);

        $recentCount = OtpVerification::query()
            ->where('phone', $normalizedPhone)
            ->where('created_at', '>=', now()->subMinutes(self::WINDOW_MINUTES))
            ->count();

        if ($recentCount >= self::MAX_SENDS_PER_WINDOW) {
            throw new DomainException(
                errorCode: 'OTP_RATE_LIMIT_EXCEEDED',
                message: 'অতিরিক্ত ওটিপি (OTP) অনুরোধ করা হয়েছে। অনুগ্রহ করে ৫ মিনিট পর আবার চেষ্টা করুন।',
                httpStatus: 429,
                details: [
                    'retry_after_seconds' => self::WINDOW_MINUTES * 60,
                ],
            );
        }

        $otpCode = (string) random_int(100000, 999999);

        OtpVerification::query()->create([
            'phone' => $normalizedPhone,
            'purpose' => $data->purpose,
            'code_hash' => Hash::make($otpCode),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
            'ip_address' => $data->ipAddress,
        ]);

        $dispatchResult = $this->smsGateway->sendOtp(
            phone: $normalizedPhone,
            otpCode: $otpCode,
            purpose: $data->purpose,
        );

        return [
            'phone_masked' => PhoneNormalizer::mask($normalizedPhone),
            'purpose' => $data->purpose->value,
            'expires_in_seconds' => self::EXPIRY_MINUTES * 60,
            'provider_message_id' => $dispatchResult->providerMessageId,
        ];
    }
}
