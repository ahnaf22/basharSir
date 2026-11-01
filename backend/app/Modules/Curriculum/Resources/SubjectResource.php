<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Resources;

use App\Modules\Curriculum\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Subject
 */
final class SubjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'class_id' => $this->class_id,
            'nctb_subject_code' => $this->nctb_subject_code,
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'slug' => $this->slug,
            'exam_structure' => $this->exam_structure_json,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'chapters' => $this->whenLoaded(
                'chapters',
                fn (): array => ChapterResource::collection($this->chapters)->resolve($request),
            ),
        ];
    }
}
