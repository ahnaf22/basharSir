<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class SubmitTutorTurnRequest extends FormRequest
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
            'client_turn_id' => ['required', 'uuid'],
            'action_type' => [
                'required',
                'string',
                Rule::in(['text_reply', 'simplify', 'example', 'hint', 'previous_step']),
            ],
            'student_input_text' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
