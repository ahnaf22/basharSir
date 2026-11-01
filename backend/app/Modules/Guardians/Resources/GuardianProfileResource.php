<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Resources;

use App\Modules\Guardians\Models\GuardianProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin GuardianProfile
 */
final class GuardianProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'relation_type' => $this->relation_type->value,
            'preferred_language' => $this->preferred_language,
            'weekly_report_channel' => $this->weekly_report_channel,
        ];
    }
}
