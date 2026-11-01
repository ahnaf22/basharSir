<?php

declare(strict_types=1);

namespace App\Modules\Identity\Actions;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Identity\Domain\Enums\AccountStatus;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Identity\DTOs\AuthResultData;
use App\Modules\Identity\DTOs\LoginData;
use Illuminate\Support\Facades\Hash;

final readonly class LoginAction
{
    public function execute(LoginData $data): AuthResultData
    {
        $normalizedPhone = PhoneNormalizer::normalize($data->phone);

        /** @var User|null $user */
        $user = User::query()
            ->with(['studentProfile', 'guardianProfile'])
            ->where('phone', $normalizedPhone)
            ->first();

        if ($user === null || $user->password === null || ! Hash::check($data->password, $user->password)) {
            throw new DomainException(
                errorCode: 'INVALID_CREDENTIALS',
                message: 'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।',
                httpStatus: 401,
            );
        }

        if ($user->status === AccountStatus::Suspended || $user->status === AccountStatus::Deleted) {
            throw new DomainException(
                errorCode: 'ACCOUNT_SUSPENDED',
                message: 'আপনার অ্যাকাউন্টটি বর্তমানে স্থগিত রয়েছে। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।',
                httpStatus: 403,
            );
        }

        $token = $user->createToken($data->deviceName)->plainTextToken;

        return new AuthResultData(
            user: $user,
            accessToken: $token,
        );
    }
}
