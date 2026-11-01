<?php

declare(strict_types=1);

namespace App\Modules\Curriculum\Models;

use App\Core\Exceptions\DomainException;
use App\Modules\Curriculum\Domain\Enums\CurriculumVersionStatus;
use App\Modules\Students\Domain\Enums\EducationMedium;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $academic_year_id
 * @property string $version_code
 * @property string $board
 * @property EducationMedium $medium
 * @property CurriculumVersionStatus $status
 * @property Carbon $effective_from
 * @property Carbon|null $effective_to
 * @property string|null $changelog_notes
 * @property int|null $published_by
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read AcademicYear $academicYear
 * @property-read Collection<int, AcademicClass> $classes
 */
#[Fillable([
    'academic_year_id',
    'version_code',
    'board',
    'medium',
    'status',
    'effective_from',
    'effective_to',
    'changelog_notes',
    'published_by',
    'published_at',
])]
class CurriculumVersion extends Model
{
    protected static function booted(): void
    {
        static::updating(function (self $version): void {
            $originalStatus = $version->getOriginal('status');
            $wasPublished = $originalStatus === CurriculumVersionStatus::Published
                || $originalStatus === CurriculumVersionStatus::Published->value;

            if (! $wasPublished) {
                return;
            }

            $immutableFields = ['academic_year_id', 'version_code', 'board', 'medium', 'effective_from'];
            foreach ($immutableFields as $field) {
                if ($version->isDirty($field)) {
                    throw new DomainException(
                        errorCode: 'PUBLISHED_CURRICULUM_IMMUTABLE',
                        message: 'প্রকাশিত পাঠ্যক্রম সংস্করণ (Published Curriculum Version) পরিবর্তনযোগ্য নয়। নতুন শিক্ষাবর্ষ বা সংশোধনের জন্য নতুন সংস্করণ তৈরি করুন।',
                        httpStatus: 422,
                    );
                }
            }

            if ($version->isDirty('status') && $version->status === CurriculumVersionStatus::Draft) {
                throw new DomainException(
                    errorCode: 'PUBLISHED_CURRICULUM_IMMUTABLE',
                    message: 'প্রকাশিত পাঠ্যক্রম সংস্করণকে পুনরায় খসড়া (Draft) অবস্থায় নেওয়া যাবে না।',
                    httpStatus: 422,
                );
            }
        });

        static::deleting(function (self $version): void {
            if ($version->status === CurriculumVersionStatus::Published || $version->status === CurriculumVersionStatus::Archived) {
                throw new DomainException(
                    errorCode: 'PUBLISHED_CURRICULUM_IMMUTABLE',
                    message: 'প্রকাশিত বা সংরক্ষিত পাঠ্যক্রম সংস্করণ মুছে ফেলা নিষিদ্ধ।',
                    httpStatus: 422,
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'medium' => EducationMedium::class,
            'status' => CurriculumVersionStatus::class,
            'effective_from' => 'date',
            'effective_to' => 'date',
            'published_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<AcademicYear, $this>
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    /**
     * @return HasMany<AcademicClass, $this>
     */
    public function classes(): HasMany
    {
        return $this->hasMany(AcademicClass::class, 'curriculum_version_id');
    }
}
