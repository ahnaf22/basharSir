<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Requests;

use App\Modules\AcademicContent\Domain\Enums\ResourceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateLearningResourceRequest extends FormRequest
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
            'curriculum_version_id' => ['required', 'integer', 'exists:curriculum_versions,id'],
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'learning_objective_id' => ['nullable', 'integer', 'exists:learning_objectives,id'],
            'resource_type' => ['required', 'string', Rule::enum(ResourceType::class)],
            'title_bn' => ['required', 'string', 'max:255'],
            'content_markdown' => ['required', 'string'],
            'nctb_page_reference' => ['nullable', 'string', 'max:60'],
            'media_assets_json' => ['nullable', 'array'],
        ];
    }
}
