<?php

declare(strict_types=1);

namespace App\Core\Http\Middleware;

use App\Core\Exceptions\DomainException;
use App\Models\User;
use App\Modules\Identity\Domain\Enums\AccountType;
use App\Modules\Identity\Domain\PhoneNormalizer;
use App\Modules\Students\Domain\Enums\ConsentStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureMinorConsentVerifiedMiddleware
{
    /**
     * Enforces Bangladesh PDPA 2026 (Act No. 63 of 2026) verifiable parental consent
     * before allowing a minor student to access AI Tutor, Exam, or Study Plan features.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            throw new DomainException(
                errorCode: 'UNAUTHENTICATED',
                message: 'এই সেবাটি ব্যবহারের জন্য লগইন করা আবশ্যক।',
                httpStatus: 401,
            );
        }

        if ($user->account_type === AccountType::Student) {
            $user->loadMissing('studentProfile');
            $profile = $user->studentProfile;

            if ($profile === null || $profile->consent_status !== ConsentStatus::Verified) {
                throw new DomainException(
                    errorCode: 'GUARDIAN_CONSENT_REQUIRED',
                    message: 'এই ফিচারটি ব্যবহারের জন্য অভিভাবকের সম্মতি (PDPA ২০২৬) প্রয়োজন।',
                    httpStatus: 403,
                    details: [
                        'consent_status' => $profile !== null ? $profile->consent_status->value : 'missing',
                        'guardian_phone_masked' => $profile?->guardian_phone_invited !== null
                            ? PhoneNormalizer::mask($profile->guardian_phone_invited)
                            : null,
                    ],
                );
            }
        }

        return $next($request);
    }
}
