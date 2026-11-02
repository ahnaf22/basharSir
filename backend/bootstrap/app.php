<?php

declare(strict_types=1);

use App\Core\Exceptions\DomainException;
use App\Core\Http\Middleware\CorrelationIdMiddleware;
use App\Core\Http\Middleware\EnsureMinorConsentVerifiedMiddleware;
use App\Core\Support\ApiResponse;
use App\Modules\Subscriptions\Middleware\EnsureFeatureEntitledMiddleware;
use App\Modules\Subscriptions\Middleware\SubscriptionQuotaMiddleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(CorrelationIdMiddleware::class);
        $middleware->alias([
            'consent.verified' => EnsureMinorConsentVerifiedMiddleware::class,
            'quota.check' => SubscriptionQuotaMiddleware::class,
            'entitlement' => EnsureFeatureEntitledMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (DomainException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: $e->getErrorCode(),
                    message: $e->getMessage(),
                    status: $e->getHttpStatus(),
                    details: $e->getDetails(),
                );
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: 'VALIDATION_ERROR',
                    message: $e->getMessage(),
                    status: $e->status,
                    details: ['fields' => $e->errors()],
                );
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: 'UNAUTHENTICATED',
                    message: 'অনুগ্রহ করে লগইন করুন।',
                    status: 401,
                );
            }
        });

        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: 'FORBIDDEN',
                    message: $e->getMessage() !== '' ? $e->getMessage() : 'আপনার এই তথ্যে প্রবেশাধিকার নেই।',
                    status: 403,
                );
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: 'RESOURCE_NOT_FOUND',
                    message: 'অনুরোধকৃত তথ্যটি পাওয়া যায়নি।',
                    status: 404,
                );
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
                    status: 429,
                );
            }
        });
    })->create();
