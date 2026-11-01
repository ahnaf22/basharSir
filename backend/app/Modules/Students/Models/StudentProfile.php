<?php

declare(strict_types=1);

namespace App\Modules\Students\Models;

use App\Models\User;
use App\Modules\Guardians\Models\ConsentRecord;
use App\Modules\Guardians\Models\StudentGuardianLink;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use App\Modules\Students\Domain\Enums\EducationMedium;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $student_code
 * @property int $current_class_level
 * @property EducationMedium $medium
 * @property string|null $school_name
 * @property string|null $district
 * @property Carbon|null $date_of_birth
 * @property ConsentStatus $consent_status
 * @property int $daily_study_target_mins
 * @property string|null $pseudonym
 * @property string|null $guardian_phone_invited
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, StudentGuardianLink> $guardianLinks
 * @property-read Collection<int, ConsentRecord> $consentRecords
 */
#[Fillable([
    'user_id',
    'student_code',
    'current_class_level',
    'medium',
    'school_name',
    'district',
    'date_of_birth',
    'consent_status',
    'daily_study_target_mins',
    'pseudonym',
    'guardian_phone_invited',
])]
class StudentProfile extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_class_level' => 'integer',
            'medium' => EducationMedium::class,
            'date_of_birth' => 'date',
            'consent_status' => ConsentStatus::class,
            'daily_study_target_mins' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<StudentGuardianLink, $this>
     */
    public function guardianLinks(): HasMany
    {
        return $this->hasMany(StudentGuardianLink::class, 'student_id');
    }

    /**
     * @return HasMany<ConsentRecord, $this>
     */
    public function consentRecords(): HasMany
    {
        return $this->hasMany(ConsentRecord::class, 'student_id');
    }
}
