<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Requests;

use App\Modules\AcademicContent\Domain\Enums\ResourceWorkflowStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class TransitionResourceWorkflowRequest extends FormRequest
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
            'target_status' => ['required', 'string', Rule::enum(ResourceWorkflowStatus::class)],
        ];
    }
}
