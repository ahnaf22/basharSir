<?php

declare(strict_types=1);

namespace App\Modules\Identity\Resources;

use App\Models\User;
use App\Modules\Guardians\Resources\GuardianProfileResource;
use App\Modules\Students\Resources\StudentProfileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
final class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();

        return [
            'uuid' => $this->uuid,
            'name_en' => $this->name_en,
            'name_bn' => $this->name_bn,
            'phone' => $this->phone,
            'email' => array_key_exists('email', $attributes) ? $this->email : null,
            'account_type' => $this->account_type->value,
            'status' => $this->status->value,
            'phone_verified' => array_key_exists('phone_verified_at', $attributes) && $this->phone_verified_at !== null,
            'student_profile' => $this->whenLoaded(
                'studentProfile',
                fn (): ?StudentProfileResource => $this->studentProfile !== null
                    ? new StudentProfileResource($this->studentProfile)
                    : null,
            ),
            'guardian_profile' => $this->whenLoaded(
                'guardianProfile',
                fn (): ?GuardianProfileResource => $this->guardianProfile !== null
                    ? new GuardianProfileResource($this->guardianProfile)
                    : null,
            ),
        ];
    }
}
