<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\DTOs;

use App\Modules\Tutoring\Enums\TutorLessonStage;

final readonly class TutorTransitionResultData
{
    /**
     * @param  array<string, mixed>  $updatedMetadata
     */
    public function __construct(
        public TutorLessonStage $nextStage,
        public array $updatedMetadata,
        public bool $wasBlockedByInvariant,
        public ?string $invariantReason = null,
    ) {}
}
