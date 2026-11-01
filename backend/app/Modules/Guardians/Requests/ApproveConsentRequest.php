<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Requests;

use App\Modules\Guardians\DTOs\ApproveConsentData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ApproveConsentRequest extends FormRequest
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
            'student_code' => ['required', 'string', 'max:30'],
            'ai_tutoring' => ['nullable', 'boolean'],
            'handwritten_ocr' => ['nullable', 'boolean'],
            'group_study' => ['nullable', 'boolean'],
            'verification_method' => ['nullable', 'string', Rule::in(['otp_sms', 'signed_form', 'guardian_portal'])],
        ];
    }

    public function toDto(): ApproveConsentData
    {
        /** @var string $studentCode */
        $studentCode = $this->validated('student_code');
        $aiTutoring = $this->validated('ai_tutoring');
        $handwrittenOcr = $this->validated('handwritten_ocr');
        $groupStudy = $this->validated('group_study');
        /** @var string|null $verificationMethod */
        $verificationMethod = $this->validated('verification_method');

        return new ApproveConsentData(
            studentCode: $studentCode,
            aiTutoring: $aiTutoring !== null ? (bool) $aiTutoring : true,
            handwrittenOcr: $handwrittenOcr !== null ? (bool) $handwrittenOcr : true,
            groupStudy: $groupStudy !== null ? (bool) $groupStudy : false,
            verificationMethod: $verificationMethod ?? 'otp_sms',
            ipAddress: $this->ip(),
            userAgent: $this->userAgent(),
        );
    }
}
