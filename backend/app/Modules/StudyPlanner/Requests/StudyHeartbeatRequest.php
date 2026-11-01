<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StudyHeartbeatRequest extends FormRequest
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
            'source_type' => [
                'required',
                'string',
                Rule::in(['tutor_session', 'exam_attempt', 'resource_study']),
            ],
            'source_id' => ['required', 'integer', 'min:1'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'is_idle' => ['nullable', 'boolean'],
            'elapsed_seconds' => ['nullable', 'integer', 'min:0', 'max:600'],
            'questions_attempted_delta' => ['nullable', 'integer', 'min:0', 'max:50'],
        ];
    }
}
