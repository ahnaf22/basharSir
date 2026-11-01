<?php

declare(strict_types=1);

namespace App\Modules\Identity\Requests;

use App\Modules\Identity\Domain\Enums\OtpPurpose;
use App\Modules\Identity\DTOs\VerifyOtpData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class VerifyOtpRequest extends FormRequest
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
            'code' => ['required', 'string', 'min:6', 'max:18'],
            'purpose' => ['nullable', 'string', Rule::enum(OtpPurpose::class)],
        ];
    }

    public function toDto(): VerifyOtpData
    {
        /** @var string $phone */
        $phone = $this->validated('phone');
        /** @var string $code */
        $code = $this->validated('code');
        /** @var string|null $purposeRaw */
        $purposeRaw = $this->validated('purpose');
        $purpose = $purposeRaw !== null ? OtpPurpose::from($purposeRaw) : OtpPurpose::PhoneVerification;

        return new VerifyOtpData(
            phone: $phone,
            code: $code,
            purpose: $purpose,
        );
    }
}
