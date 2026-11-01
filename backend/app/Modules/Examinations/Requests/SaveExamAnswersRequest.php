<?php

declare(strict_types=1);

namespace App\Modules\Examinations\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SaveExamAnswersRequest extends FormRequest
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
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'answers.*.answer_mode' => [
                'nullable',
                'string',
                Rule::in(['mcq_choice', 'typed_text', 'handwritten_upload']),
            ],
            'answers.*.selected_option_key' => ['nullable', 'string', 'max:20'],
            'answers.*.typed_answer_text' => ['nullable', 'string', 'max:5000'],
            'answers.*.is_flagged_for_review' => ['nullable', 'boolean'],
            'answers.*.time_spent_seconds' => ['nullable', 'integer', 'min:0', 'max:7200'],
        ];
    }
}
