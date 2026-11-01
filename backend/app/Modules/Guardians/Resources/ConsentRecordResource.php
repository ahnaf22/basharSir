<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Resources;

use App\Modules\Guardians\Models\ConsentRecord;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ConsentRecord
 */
final class ConsentRecordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'policy_version' => $this->policy_version,
            'consent_scope' => $this->consent_scope_json,
            'verification_method' => $this->verification_method,
            'consented_at' => $this->consented_at->toIso8601String(),
            'withdrawn_at' => $this->withdrawn_at?->toIso8601String(),
        ];
    }
}
