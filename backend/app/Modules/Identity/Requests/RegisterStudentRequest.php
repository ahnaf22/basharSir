<?php

declare(strict_types=1);

namespace App\Modules\Identity\Requests;

use App\Modules\Identity\DTOs\RegisterStudentData;
use App\Modules\Students\Domain\Enums\EducationMedium;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class RegisterStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_en' => ['required', 'string', 'max:150'],
            'name_bn' => ['nullable', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:25'],
            'guardian_phone' => ['required', 'string', 'max:25'],
            'current_class_level' => ['required', 'integer', 'between:1,10'],
            'medium' => ['nullable', 'string', Rule::enum(EducationMedium::class)],
            'password' => ['nullable', 'string', 'min:8', 'max:120'],
            'email' => ['nullable', 'email', 'max:191'],
            'school_name' => ['nullable', 'string', 'max:200'],
            'district' => ['nullable', 'string', 'max:80'],
            'date_of_birth' => ['nullable', 'date'],
        ];
    }

    public function toDto(): RegisterStudentData
    {
        /** @var string $nameEn */
        $nameEn = $this->validated('name_en');
        /** @var string|null $nameBn */
        $nameBn = $this->validated('name_bn');
        /** @var string $phone */
        $phone = $this->validated('phone');
        /** @var string $guardianPhone */
        $guardianPhone = $this->validated('guardian_phone');
        $classLevel = (int) $this->validated('current_class_level');
        /** @var string|null $mediumRaw */
        $mediumRaw = $this->validated('medium');
        $medium = $mediumRaw !== null ? EducationMedium::from($mediumRaw) : EducationMedium::Bangla;
        /** @var string|null $password */
        $password = $this->validated('password');
        /** @var string|null $email */
        $email = $this->validated('email');
        /** @var string|null $schoolName */
        $schoolName = $this->validated('school_name');
        /** @var string|null $district */
        $district = $this->validated('district');
        /** @var string|null $dateOfBirth */
        $dateOfBirth = $this->validated('date_of_birth');

        return new RegisterStudentData(
            nameEn: $nameEn,
            nameBn: $nameBn,
            phone: $phone,
            guardianPhone: $guardianPhone,
            currentClassLevel: $classLevel,
            medium: $medium,
            password: $password,
            email: $email,
            schoolName: $schoolName,
            district: $district,
            dateOfBirth: $dateOfBirth,
            ipAddress: $this->ip(),
        );
    }
}
