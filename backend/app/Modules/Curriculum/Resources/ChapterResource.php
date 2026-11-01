<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Resources;

use App\Modules\Curriculum\Models\Chapter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Chapter
 */
final class ChapterResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'chapter_number' => $this->chapter_number,
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'syllabus_status' => $this->syllabus_status,
            'estimated_study_minutes' => $this->estimated_study_minutes,
            'sort_order' => $this->sort_order,
            'topics' => $this->whenLoaded(
                'topics',
                fn (): array => TopicResource::collection($this->topics)->resolve($request),
            ),
        ];
    }
}
