<?php

declare(strict_types=1);

namespace App\Modules\TeacherMarketplace\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $teacher_code
 * @property string $full_name_bn
 * @property string $full_name_en
 * @property string $university_and_degree_bn
 * @property array<int, string> $specializations_json
 * @property int $hourly_rate_bdt
 * @property string $vetting_status
 * @property Carbon|null $verified_at
 */
final class TeacherProfile extends Model
{
    protected $table = 'teacher_profiles';

    protected $fillable = [
        'user_id',
        'teacher_code',
        'full_name_bn',
        'full_name_en',
        'university_and_degree_bn',
        'specializations_json',
        'hourly_rate_bdt',
        'vetting_status',
        'verified_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'specializations_json' => 'array',
            'hourly_rate_bdt' => 'integer',
            'verified_at' => 'datetime',
        ];
    }
}
