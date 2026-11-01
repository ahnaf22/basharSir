<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Domain\Enums;

enum ResourceWorkflowStatus: string
{
    case Draft = 'draft';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Published = 'published';
    case Archived = 'archived';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::Draft => $next === self::InReview,
            self::InReview => $next === self::Approved || $next === self::Draft,
            self::Approved => $next === self::Published || $next === self::InReview,
            self::Published => $next === self::Archived,
            self::Archived => false,
        };
    }
}
