<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Requests;

use App\Modules\Guardians\DTOs\RevokeConsentData;
use Illuminate\Foundation\Http\FormRequest;

final class RevokeConsentRequest extends FormRequest
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
        ];
    }

    public function toDto(): RevokeConsentData
    {
        /** @var string $studentCode */
        $studentCode = $this->validated('student_code');

        return new RevokeConsentData(
            studentCode: $studentCode,
            ipAddress: $this->ip(),
        );
    }
}
