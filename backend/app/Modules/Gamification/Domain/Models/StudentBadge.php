<?php

declare(strict_types=1);

namespace App\Modules\Gamification\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property string $badge_code
 * @property string $title_bn
 * @property Carbon $awarded_at
 */
final class StudentBadge extends Model
{
    protected $table = 'student_badges';

    protected $fillable = [
        'student_id',
        'badge_code',
        'title_bn',
        'awarded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'student_id' => 'integer',
            'awarded_at' => 'datetime',
        ];
    }
}
