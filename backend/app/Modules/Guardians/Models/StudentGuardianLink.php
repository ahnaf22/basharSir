<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Models;

use App\Modules\Guardians\Domain\Enums\GuardianLinkStatus;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $guardian_id
 * @property bool $is_primary_payer
 * @property GuardianLinkStatus $status
 * @property Carbon|null $verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read StudentProfile $student
 * @property-read GuardianProfile $guardian
 */
#[Fillable([
    'student_id',
    'guardian_id',
    'is_primary_payer',
    'status',
    'verified_at',
])]
class StudentGuardianLink extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary_payer' => 'boolean',
            'status' => GuardianLinkStatus::class,
            'verified_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    /**
     * @return BelongsTo<GuardianProfile, $this>
     */
    public function guardian(): BelongsTo
    {
        return $this->belongsTo(GuardianProfile::class, 'guardian_id');
    }
}
