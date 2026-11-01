<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;

final class CreateStudyPlanRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:200'],
            'chapter_ids' => ['required', 'array', 'min:1'],
            'chapter_ids.*' => ['integer', 'exists:chapters,id'],
            'target_completion_date' => ['required', 'date'],
            'daily_study_minutes' => ['nullable', 'integer', 'min:15', 'max:360'],
        ];
    }
}
