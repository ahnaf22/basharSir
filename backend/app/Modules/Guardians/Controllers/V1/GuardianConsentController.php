<?php

declare(strict_types=1);

namespace App\Modules\Guardians\Controllers\V1;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Guardians\Actions\ApproveMinorConsentAction;
use App\Modules\Guardians\Actions\LinkChildToGuardianAction;
use App\Modules\Guardians\Actions\ListGuardianChildrenAction;
use App\Modules\Guardians\Actions\RevokeMinorConsentAction;
use App\Modules\Guardians\Requests\ApproveConsentRequest;
use App\Modules\Guardians\Requests\LinkChildRequest;
use App\Modules\Guardians\Requests\RevokeConsentRequest;
use App\Modules\Guardians\Resources\ConsentRecordResource;
use App\Modules\Guardians\Resources\LinkedChildResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class GuardianConsentController extends Controller
{
    public function listChildren(
        Request $request,
        ListGuardianChildrenAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $links = $action->execute($user);

        return ApiResponse::success(
            data: [
                'children' => LinkedChildResource::collection($links)->resolve($request),
            ],
            message: 'অভিভাবকের সাথে যুক্ত সন্তানদের তালিকা সফলভাবে লোড হয়েছে।',
        );
    }

    public function linkChild(
        LinkChildRequest $request,
        LinkChildToGuardianAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $link = $action->execute($user, $request->toDto());

        return ApiResponse::success(
            data: (new LinkedChildResource($link))->resolve($request),
            message: 'সন্তানের প্রোফাইল সফলভাবে অভিভাবক অ্যাকাউন্টের সাথে যুক্ত হয়েছে।',
            status: 201,
        );
    }

    public function approveConsent(
        ApproveConsentRequest $request,
        ApproveMinorConsentAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $result = $action->execute($user, $request->toDto());

        return ApiResponse::success(
            data: [
                'child' => (new LinkedChildResource($result['link']))->resolve($request),
                'consent_record' => (new ConsentRecordResource($result['consent_record']))->resolve($request),
            ],
            message: 'বাংলাদেশ ব্যক্তিগত উপাত্ত সুরক্ষা আইন ২০২৬ (PDPA 2026) অনুযায়ী অভিভাবকের সম্মতি সফলভাবে সংরক্ষিত হয়েছে।',
        );
    }

    public function revokeConsent(
        RevokeConsentRequest $request,
        RevokeMinorConsentAction $action,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $link = $action->execute($user, $request->toDto());

        return ApiResponse::success(
            data: [
                'child' => (new LinkedChildResource($link))->resolve($request),
            ],
            message: 'অভিভাবকের সম্মতি প্রত্যাহার করা হয়েছে এবং শিক্ষার্থীর এআই (AI) ফিচার সাময়িকভাবে স্থগিত করা হয়েছে।',
        );
    }
}
