<?php

declare(strict_types=1);

namespace App\Modules\Identity\Requests;

use App\Modules\Identity\DTOs\LoginData;
use Illuminate\Foundation\Http\FormRequest;

final class LoginRequest extends FormRequest
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
            'phone' => ['required', 'string', 'max:25'],
            'password' => ['required', 'string', 'max:120'],
            'device_name' => ['nullable', 'string', 'max:80'],
        ];
    }

    public function toDto(): LoginData
    {
        /** @var string $phone */
        $phone = $this->validated('phone');
        /** @var string $password */
        $password = $this->validated('password');
        /** @var string|null $deviceName */
        $deviceName = $this->validated('device_name');

        return new LoginData(
            phone: $phone,
            password: $password,
            deviceName: $deviceName ?? 'web-client',
        );
    }
}
