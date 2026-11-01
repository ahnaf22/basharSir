<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $service_name
 * @property string $version_code
 * @property string $system_prompt_template
 * @property string $model_tier
 * @property bool $is_active
 */
final class PromptVersion extends Model
{
    protected $table = 'prompt_versions';

    protected $fillable = [
        'service_name',
        'version_code',
        'system_prompt_template',
        'model_tier',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
