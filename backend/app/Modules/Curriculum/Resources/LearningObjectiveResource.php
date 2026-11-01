<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Resources;

use App\Modules\Curriculum\Models\LearningObjective;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LearningObjective
 */
final class LearningObjectiveResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'topic_id' => $this->topic_id,
            'code' => $this->code,
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'bloom_level' => $this->bloom_level->value,
            'mastery_threshold_pct' => $this->mastery_threshold_pct,
            'sort_order' => $this->sort_order,
            'prerequisites' => $this->whenLoaded(
                'prerequisites',
                fn (): array => $this->prerequisites->map(
                    static fn (LearningObjective $prereq): array => [
                        'id' => $prereq->id,
                        'code' => $prereq->code,
                        'title_bn' => $prereq->title_bn,
                        'title_en' => $prereq->title_en,
                    ]
                )->all(),
            ),
        ];
    }
}
