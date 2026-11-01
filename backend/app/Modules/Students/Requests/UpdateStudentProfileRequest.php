<?php

declare(strict_types=1);

namespace App\Modules\Students\Requests;

use App\Models\User;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Students\Domain\Enums\EducationMedium;
use App\Modules\Students\DTOs\UpdateStudentProfileData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->account_type === AccountType::Student;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_bn' => ['nullable', 'string', 'max:150'],
            'name_en' => ['nullable', 'string', 'max:150'],
            'current_class_level' => ['nullable', 'integer', 'between:1,10'],
            'medium' => ['nullable', 'string', Rule::enum(EducationMedium::class)],
            'school_name' => ['nullable', 'string', 'max:200'],
            'district' => ['nullable', 'string', 'max:80'],
            'daily_study_target_mins' => ['nullable', 'integer', 'between:15,360'],
            'pseudonym' => ['nullable', 'string', 'max:80'],
        ];
    }

    public function toDto(): UpdateStudentProfileData
    {
        /** @var string|null $nameBn */
        $nameBn = $this->validated('name_bn');
        /** @var string|null $nameEn */
        $nameEn = $this->validated('name_en');
        $classLevel = $this->validated('current_class_level');
        /** @var string|null $mediumRaw */
        $mediumRaw = $this->validated('medium');
        /** @var string|null $schoolName */
        $schoolName = $this->validated('school_name');
        /** @var string|null $district */
        $district = $this->validated('district');
        $studyTarget = $this->validated('daily_study_target_mins');
        /** @var string|null $pseudonym */
        $pseudonym = $this->validated('pseudonym');

        return new UpdateStudentProfileData(
            nameBn: $nameBn,
            nameEn: $nameEn,
            currentClassLevel: $classLevel !== null ? (int) $classLevel : null,
            medium: $mediumRaw !== null ? EducationMedium::from($mediumRaw) : null,
            schoolName: $schoolName,
            district: $district,
            dailyStudyTargetMins: $studyTarget !== null ? (int) $studyTarget : null,
            pseudonym: $pseudonym,
        );
    }
}
