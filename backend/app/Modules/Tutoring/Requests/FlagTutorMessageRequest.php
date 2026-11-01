<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class FlagTutorMessageRequest extends FormRequest
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
            'tutor_message_id' => ['required', 'integer', 'exists:tutor_messages,id'],
            'reason_code' => [
                'required',
                'string',
                Rule::in(['factual_error', 'math_error', 'out_of_syllabus', 'unclear_bangla', 'other']),
            ],
            'student_comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
