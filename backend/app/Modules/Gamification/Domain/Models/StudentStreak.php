<?php

declare(strict_types=1);

namespace App\Modules\Gamification\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $current_streak_days
 * @property int $longest_streak_days
 * @property int $streak_freezes_available
 * @property Carbon|null $last_active_date
 * @property bool $leaderboard_opt_in
 * @property string|null $leaderboard_pseudonym_bn
 */
final class StudentStreak extends Model
{
    protected $table = 'student_streaks';

    protected $fillable = [
        'student_id',
        'current_streak_days',
        'longest_streak_days',
        'streak_freezes_available',
        'last_active_date',
        'leaderboard_opt_in',
        'leaderboard_pseudonym_bn',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'student_id' => 'integer',
            'current_streak_days' => 'integer',
            'longest_streak_days' => 'integer',
            'streak_freezes_available' => 'integer',
            'last_active_date' => 'date',
            'leaderboard_opt_in' => 'boolean',
        ];
    }
}
