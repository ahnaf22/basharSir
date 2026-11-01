<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property Carbon $usage_date
 * @property int $ai_turns_used
 * @property int $script_ocr_used
 * @property int $total_input_tokens
 * @property int $total_output_tokens
 * @property string $total_cost_bdt
 */
final class UsageLedger extends Model
{
    protected $table = 'usage_ledger';

    protected $fillable = [
        'student_id',
        'usage_date',
        'ai_turns_used',
        'script_ocr_used',
        'total_input_tokens',
        'total_output_tokens',
        'total_cost_bdt',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'usage_date' => 'date',
            'ai_turns_used' => 'integer',
            'script_ocr_used' => 'integer',
            'total_input_tokens' => 'integer',
            'total_output_tokens' => 'integer',
            'total_cost_bdt' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsTo<StudentProfile, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }
}
