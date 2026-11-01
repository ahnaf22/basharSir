<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Modules\Students\Models\StudentProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $uuid
 * @property int|null $student_id
 * @property int|null $subscription_id
 * @property string $ai_service
 * @property string $provider
 * @property string $model_name
 * @property int|null $prompt_version_id
 * @property string $sanitized_prompt_hash
 * @property int $pii_redacted_count
 * @property int $input_tokens
 * @property int $output_tokens
 * @property string $estimated_cost_usd
 * @property string $estimated_cost_bdt
 * @property int $latency_ms
 * @property string $status
 * @property string|null $error_code
 */
final class AiRequest extends Model
{
    protected $table = 'ai_requests';

    protected $fillable = [
        'uuid',
        'student_id',
        'subscription_id',
        'ai_service',
        'provider',
        'model_name',
        'prompt_version_id',
        'sanitized_prompt_hash',
        'pii_redacted_count',
        'input_tokens',
        'output_tokens',
        'estimated_cost_usd',
        'estimated_cost_bdt',
        'latency_ms',
        'status',
        'error_code',
    ];

    protected static function booted(): void
    {
        self::creating(function (AiRequest $request): void {
            if (empty($request->uuid)) {
                $request->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pii_redacted_count' => 'integer',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'estimated_cost_usd' => 'decimal:6',
            'estimated_cost_bdt' => 'decimal:4',
            'latency_ms' => 'integer',
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
     * @return BelongsTo<PromptVersion, $this>
     */
    public function promptVersion(): BelongsTo
    {
        return $this->belongsTo(PromptVersion::class, 'prompt_version_id');
    }
}
