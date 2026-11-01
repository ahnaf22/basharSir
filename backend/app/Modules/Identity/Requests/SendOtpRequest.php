<?php

declare(strict_types=1);

namespace App\Modules\Identity\Requests;

use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Identity\DTOs\SendOtpData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:25'],
            'purpose' => ['nullable', 'string', Rule::enum(OtpPurpose::class)],
        ];
    }

    public function toDto(): SendOtpData
    {
        /** @var string $phone */
        $phone = $this->validated('phone');
        /** @var string|null $purposeRaw */
        $purposeRaw = $this->validated('purpose');
        $purpose = $purposeRaw !== null ? OtpPurpose::from($purposeRaw) : OtpPurpose::PhoneVerification;

        return new SendOtpData(
            phone: $phone,
            purpose: $purpose,
            ipAddress: $this->ip(),
        );
    }
}
