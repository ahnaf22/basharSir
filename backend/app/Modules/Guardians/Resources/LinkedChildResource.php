<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Resources;

use App\Modules\Guardians\Models\ConsentRecord;
use App\Modules\Guardians\Models\StudentGuardianLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin StudentGuardianLink
 */
final class LinkedChildResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $student = $this->student;
        $studentUser = $student->user;

        /** @var ConsentRecord|null $latestConsent */
        $latestConsent = $student->relationLoaded('consentRecords')
            ? $student->consentRecords->sortByDesc('id')->first()
            : null;

        return [
            'link_id' => $this->id,
            'link_status' => $this->status->value,
            'is_primary_payer' => $this->is_primary_payer,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'student' => [
                'student_id' => $student->id,
                'user_uuid' => $studentUser->uuid,
                'name_en' => $studentUser->name_en,
                'name_bn' => $studentUser->name_bn,
                'phone' => $studentUser->phone,
                'student_code' => $student->student_code,
                'current_class_level' => $student->current_class_level,
                'medium' => $student->medium->value,
                'school_name' => $student->school_name,
                'district' => $student->district,
                'consent_status' => $student->consent_status->value,
                'daily_study_target_mins' => $student->daily_study_target_mins,
            ],
            'latest_consent' => $latestConsent !== null
                ? (new ConsentRecordResource($latestConsent))->resolve($request)
                : null,
        ];
    }
}
