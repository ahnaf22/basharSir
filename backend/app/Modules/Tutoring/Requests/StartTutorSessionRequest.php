<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;

final class StartTutorSessionRequest extends FormRequest
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
            'learning_objective_id' => ['required', 'integer', 'exists:learning_objectives,id'],
        ];
    }
}
