<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class SaveResourceAnnotationRequest extends FormRequest
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
            'is_bookmarked' => ['nullable', 'boolean'],
            'highlights' => ['nullable', 'array'],
            'highlights.*' => ['string', 'max:500'],
            'personal_note_markdown' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
