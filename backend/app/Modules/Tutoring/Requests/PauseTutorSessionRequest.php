<?php

declare(strict_types=1);

namespace App\Modules\Tutoring\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;

final class PauseTutorSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->account_type === AccountType::Student;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'active_duration_delta_seconds' => ['nullable', 'integer', 'min:0', 'max:7200'],
        ];
    }
}
