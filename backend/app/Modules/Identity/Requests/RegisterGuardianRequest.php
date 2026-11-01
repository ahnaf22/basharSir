<?php

declare(strict_types=1);

namespace App\Modules\Identity\Requests;

use App\Modules\Guardians\Domain\Enums\GuardianRelationType;
use App\Modules\Identity\DTOs\RegisterGuardianData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class RegisterGuardianRequest extends FormRequest
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
            'name_en' => ['required', 'string', 'max:150'],
            'name_bn' => ['nullable', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:25'],
            'relation_type' => ['nullable', 'string', Rule::enum(GuardianRelationType::class)],
            'password' => ['nullable', 'string', 'min:8', 'max:120'],
            'email' => ['nullable', 'email', 'max:191'],
            'preferred_language' => ['nullable', 'string', Rule::in(['bn', 'en'])],
            'weekly_report_channel' => ['nullable', 'string', Rule::in(['sms', 'whatsapp', 'email', 'push'])],
        ];
    }

    public function toDto(): RegisterGuardianData
    {
        /** @var string $nameEn */
        $nameEn = $this->validated('name_en');
        /** @var string|null $nameBn */
        $nameBn = $this->validated('name_bn');
        /** @var string $phone */
        $phone = $this->validated('phone');
        /** @var string|null $relationRaw */
        $relationRaw = $this->validated('relation_type');
        $relationType = $relationRaw !== null ? GuardianRelationType::from($relationRaw) : GuardianRelationType::LegalGuardian;
        /** @var string|null $password */
        $password = $this->validated('password');
        /** @var string|null $email */
        $email = $this->validated('email');
        /** @var string|null $preferredLanguage */
        $preferredLanguage = $this->validated('preferred_language');
        /** @var string|null $weeklyChannel */
        $weeklyChannel = $this->validated('weekly_report_channel');

        return new RegisterGuardianData(
            nameEn: $nameEn,
            nameBn: $nameBn,
            phone: $phone,
            relationType: $relationType,
            password: $password,
            email: $email,
            preferredLanguage: $preferredLanguage ?? 'bn',
            weeklyReportChannel: $weeklyChannel ?? 'sms',
            ipAddress: $this->ip(),
        );
    }
}
