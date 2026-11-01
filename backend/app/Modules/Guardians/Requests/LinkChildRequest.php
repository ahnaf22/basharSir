<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Requests;

use App\Modules\Guardians\DTOs\LinkChildData;
use Illuminate\Foundation\Http\FormRequest;

final class LinkChildRequest extends FormRequest
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
            'student_code' => ['nullable', 'required_without:student_phone', 'string', 'max:30'],
            'student_phone' => ['nullable', 'required_without:student_code', 'string', 'max:25'],
            'is_primary_payer' => ['nullable', 'boolean'],
        ];
    }

    public function toDto(): LinkChildData
    {
        /** @var string|null $studentCode */
        $studentCode = $this->validated('student_code');
        /** @var string|null $studentPhone */
        $studentPhone = $this->validated('student_phone');
        $isPrimaryPayer = $this->validated('is_primary_payer');

        return new LinkChildData(
            studentCode: $studentCode,
            studentPhone: $studentPhone,
            isPrimaryPayer: $isPrimaryPayer !== null ? (bool) $isPrimaryPayer : true,
        );
    }
}
