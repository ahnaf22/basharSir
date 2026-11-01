<?php

declare(strict_types=1);

namespace App\Modules\StudyPlanner\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class RescheduleStudyPlanItemRequest extends FormRequest
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
            'scheduled_date' => ['nullable', 'date'],
            'status' => [
                'nullable',
                'string',
                Rule::in(['scheduled', 'in_progress', 'completed', 'rescheduled']),
            ],
            'actual_active_minutes' => ['nullable', 'integer', 'min:0', 'max:360'],
        ];
    }
}
