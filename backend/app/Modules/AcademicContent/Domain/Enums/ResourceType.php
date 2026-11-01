<?php

declare(strict_types=1);

namespace App\Modules\AcademicContent\Domain\Enums;

enum ResourceType: string
{
    case LessonNote = 'lesson_note';
    case Summary = 'summary';
    case Definition = 'definition';
    case WorkedExample = 'worked_example';
    case Diagram = 'diagram';
    case FormulaSheet = 'formula_sheet';
}
