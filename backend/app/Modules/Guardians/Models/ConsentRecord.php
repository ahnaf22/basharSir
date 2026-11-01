<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $guardian_id
 * @property string $policy_version
 * @property array<string, bool> $consent_scope_json
 * @property string $verification_method
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property Carbon $consented_at
 * @property Carbon|null $withdrawn_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read StudentProfile $student
 * @property-read GuardianProfile $guardian
 */
#[Fillable([
    'student_id',
    'guardian_id',
    'policy_version',
    'consent_scope_json',
    'verification_method',
    'ip_address',
    'user_agent',
    'consented_at',
    'withdrawn_at',
])]
class ConsentRecord extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consent_scope_json' => 'array',
            'consented_at' => 'datetime',
            'withdrawn_at' => 'datetime',
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
