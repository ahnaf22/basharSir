<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AddObjectivePrerequisiteRequest extends FormRequest
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
            'prerequisite_objective_id' => ['required', 'integer', 'min:1'],
            'is_strict' => ['nullable', 'boolean'],
        ];
    }
}
