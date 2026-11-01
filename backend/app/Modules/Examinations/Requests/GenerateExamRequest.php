<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class GenerateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->account_type === AccountType::Student;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'exam_type' => ['required', 'string', Rule::in(['chapter', 'subject', 'model_board'])],
            'title_bn' => ['required', 'string', 'max:255'],
            'chapter_ids' => ['nullable', 'array'],
            'chapter_ids.*' => ['integer', 'exists:chapters,id'],
            'duration_minutes' => ['nullable', 'integer', 'min:5', 'max:180'],
        ];
    }
}
