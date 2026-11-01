<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Resources;

use App\Modules\Curriculum\Models\AcademicClass;
use App\Modules\Curriculum\Models\CurriculumVersion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CurriculumVersion
 */
final class CurriculumVersionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version_code' => $this->version_code,
            'board' => $this->board,
            'medium' => $this->medium->value,
            'status' => $this->status->value,
            'effective_from' => $this->effective_from->format('Y-m-d'),
            'effective_to' => $this->effective_to?->format('Y-m-d'),
            'academic_year' => $this->whenLoaded(
                'academicYear',
                fn (): array => [
                    'year_code' => $this->academicYear->year_code,
                    'title_bn' => $this->academicYear->title_bn,
                    'is_current' => $this->academicYear->is_current,
                ],
            ),
            'classes' => $this->whenLoaded(
                'classes',
                fn (): array => $this->classes->map(
                    static fn (AcademicClass $cls): array => [
                        'id' => $cls->id,
                        'grade_level' => $cls->grade_level,
                        'education_stage' => $cls->education_stage->value,
                        'title_bn' => $cls->title_bn,
                        'title_en' => $cls->title_en,
                    ]
                )->all(),
            ),
        ];
    }
}
