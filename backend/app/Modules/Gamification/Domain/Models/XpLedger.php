<?php

declare(strict_types=1);

namespace App\Modules\Gamification\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property string $source_type
 * @property int $source_id
 * @property int $xp_points
 * @property string $reason_bn
 * @property Carbon $earned_date
 */
final class XpLedger extends Model
{
    protected $table = 'xp_ledger';

    protected $fillable = [
        'student_id',
        'source_type',
        'source_id',
        'xp_points',
        'reason_bn',
        'earned_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'student_id' => 'integer',
            'source_id' => 'integer',
            'xp_points' => 'integer',
            'earned_date' => 'date',
        ];
    }
}
