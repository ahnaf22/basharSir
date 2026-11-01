<?php

declare(strict_types=1);

namespace App\Modules\Notifications\Services;

use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Notifications\Contracts\SmsGatewayInterface;
use App\Modules\Notifications\DTOs\SmsDispatchResult;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class LogSmsGateway implements SmsGatewayInterface
{
    /**
     * In-memory store for inspecting dispatched OTP codes in local/test environments.
     *
     * @var array<string, array{otp_code: string, purpose: string, message_id: string}>
     */
    private array $dispatchedOtps = [];

    public function sendOtp(string $phone, string $otpCode, OtpPurpose $purpose): SmsDispatchResult
    {
        $messageId = 'sms_'.Str::lower(Str::ulid()->toString());

        Log::info('BD SMS OTP Dispatched', [
            'phone_masked' => PhoneNormalizer::mask($phone),
            'purpose' => $purpose->value,
            'provider_message_id' => $messageId,
        ]);

        $this->dispatchedOtps[$phone] = [
            'otp_code' => $otpCode,
            'purpose' => $purpose->value,
            'message_id' => $messageId,
        ];

        return new SmsDispatchResult(
            delivered: true,
            providerMessageId: $messageId,
            channel: 'log',
        );
    }

    public function lastOtpFor(string $phone): ?string
    {
        $normalized = PhoneNormalizer::normalize($phone);

        return $this->dispatchedOtps[$normalized]['otp_code'] ?? null;
    }

    public function clearDispatched(): void
    {
        $this->dispatchedOtps = [];
    }
}
