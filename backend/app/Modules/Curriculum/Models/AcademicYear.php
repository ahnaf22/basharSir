<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $year_code
 * @property string $title_bn
 * @property Carbon $starts_on
 * @property Carbon $ends_on
 * @property bool $is_current
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, CurriculumVersion> $curriculumVersions
 */
#[Fillable([
    'year_code',
    'title_bn',
    'starts_on',
    'ends_on',
    'is_current',
])]
class AcademicYear extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'is_current' => 'boolean',
        ];
    }

    /**
     * @return HasMany<CurriculumVersion, $this>
     */
    public function curriculumVersions(): HasMany
    {
        return $this->hasMany(CurriculumVersion::class, 'academic_year_id');
    }
}
