<?php

declare(strict_types=1);

namespace App\Modules\Students\Resources;

use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Students\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StudentProfile
 */
final class StudentProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'student_code' => $this->student_code,
            'current_class_level' => $this->current_class_level,
            'medium' => $this->medium->value,
            'school_name' => $this->school_name,
            'district' => $this->district,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'consent_status' => $this->consent_status->value,
            'daily_study_target_mins' => $this->daily_study_target_mins,
            'pseudonym' => $this->pseudonym,
            'guardian_phone_masked' => $this->guardian_phone_invited !== null
                ? PhoneNormalizer::mask($this->guardian_phone_invited)
                : null,
        ];
    }
}
