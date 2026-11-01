<?php

declare(strict_types=1);

namespace App\Modules\Identity\Controllers\V1;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Identity\Actions\LoginAction;
use App\Modules\Identity\Actions\LogoutAction;
use App\Modules\Identity\Actions\RegisterGuardianAction;
use App\Modules\Identity\Actions\RegisterStudentAction;
use App\Modules\Identity\Actions\SendOtpAction;
use App\Modules\Identity\Actions\VerifyOtpAction;
use App\Modules\Identity\Requests\LoginRequest;
use App\Modules\Identity\Requests\RegisterGuardianRequest;
use App\Modules\Identity\Requests\RegisterStudentRequest;
use App\Modules\Identity\Requests\SendOtpRequest;
use App\Modules\Identity\Requests\VerifyOtpRequest;
use App\Modules\Identity\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuthController extends Controller
{
    public function registerStudent(
        RegisterStudentRequest $request,
        RegisterStudentAction $action,
    ): JsonResponse {
        $result = $action->execute($request->toDto());

        return ApiResponse::success(
            data: [
                'user' => (new UserResource($result->user))->resolve($request),
                'access_token' => $result->accessToken,
            ],
            message: 'শিক্ষার্থী অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। অভিভাবকের মোবাইল নম্বরে সম্মতি ওটিপি (OTP) পাঠানো হয়েছে।',
            status: 201,
        );
    }

    public function registerGuardian(
        RegisterGuardianRequest $request,
        RegisterGuardianAction $action,
    ): JsonResponse {
        $result = $action->execute($request->toDto());

        return ApiResponse::success(
            data: [
                'user' => (new UserResource($result->user))->resolve($request),
                'access_token' => $result->accessToken,
            ],
            message: 'অভিভাবক অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। মোবাইল নম্বর যাচাইয়ের জন্য ওটিপি পাঠানো হয়েছে।',
            status: 201,
        );
    }

    public function sendOtp(
        SendOtpRequest $request,
        SendOtpAction $action,
    ): JsonResponse {
        $result = $action->execute($request->toDto());

        return ApiResponse::success(
            data: $result,
            message: 'আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি (OTP) পাঠানো হয়েছে।',
        );
    }

    public function verifyOtp(
        VerifyOtpRequest $request,
        VerifyOtpAction $action,
    ): JsonResponse {
        $result = $action->execute($request->toDto());

        return ApiResponse::success(
            data: [
                'verified' => $result['verified'],
                'phone' => $result['phone'],
                'purpose' => $result['purpose'],
                'user' => $result['user'] instanceof User
                    ? (new UserResource($result['user']))->resolve($request)
                    : null,
                'access_token' => $result['access_token'],
            ],
            message: 'ওটিপি (OTP) সফলভাবে যাচাই করা হয়েছে।',
        );
    }

    public function login(
        LoginRequest $request,
        LoginAction $action,
    ): JsonResponse {
        $result = $action->execute($request->toDto());

        return ApiResponse::success(
            data: [
                'user' => (new UserResource($result->user))->resolve($request),
                'access_token' => $result->accessToken,
            ],
            message: 'সফলভাবে লগইন সম্পন্ন হয়েছে।',
        );
    }

    public function logout(
        Request $request,
        LogoutAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $action->execute($user);

        return ApiResponse::success(
            data: ['logged_out' => true],
            message: 'সফলভাবে লগআউট করা হয়েছে।',
        );
    }
}
