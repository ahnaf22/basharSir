<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Models;

use App\Models\User;
use App\Modules\Guardians\Domain\Enums\GuardianRelationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property GuardianRelationType $relation_type
 * @property string $preferred_language
 * @property string $weekly_report_channel
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, StudentGuardianLink> $studentLinks
 * @property-read Collection<int, ConsentRecord> $consentRecords
 */
#[Fillable([
    'user_id',
    'relation_type',
    'preferred_language',
    'weekly_report_channel',
])]
class GuardianProfile extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'relation_type' => GuardianRelationType::class,
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
    public function studentLinks(): HasMany
    {
        return $this->hasMany(StudentGuardianLink::class, 'guardian_id');
    }

    /**
     * @return HasMany<ConsentRecord, $this>
     */
    public function consentRecords(): HasMany
    {
        return $this->hasMany(ConsentRecord::class, 'guardian_id');
    }
}
