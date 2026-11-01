<?php

declare(strict_types=1);

namespace App\Modules\Subscriptions\Requests;

use App\Modules\Identity\Domain\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;

final class InitiatePaymentCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->account_type === AccountType::Guardian;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'plan_code' => ['required', 'string', 'exists:subscription_plans,code'],
            'gateway' => ['required', 'string', 'in:bkash,nagad,sslcommerz'],
            'student_code' => ['nullable', 'string', 'exists:student_profiles,student_code'],
            'idempotency_key' => ['required', 'string', 'max:100'],
        ];
    }
}
