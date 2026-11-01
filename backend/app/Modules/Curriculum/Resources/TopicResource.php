<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Resources;

use App\Modules\Curriculum\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Topic
 */
final class TopicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chapter_id' => $this->chapter_id,
            'topic_number' => $this->topic_number,
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'estimated_minutes' => $this->estimated_minutes,
            'difficulty_level' => $this->difficulty_level,
            'sort_order' => $this->sort_order,
            'learning_objectives' => $this->whenLoaded(
                'learningObjectives',
                fn (): array => LearningObjectiveResource::collection($this->learningObjectives)->resolve($request),
            ),
        ];
    }
}
