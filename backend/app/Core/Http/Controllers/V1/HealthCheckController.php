<?php

declare(strict_types=1);

namespace App\Core\Http\Controllers\V1;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

final class HealthCheckController extends Controller
{
    /**
     * GET /api/v1/health
     * Returns platform readiness, database & cache connectivity, and active NCTB curriculum metadata.
     */
    public function __invoke(): JsonResponse
    {
        $dbHealthy = false;
        $cacheHealthy = false;

        try {
            DB::connection()->getPdo();
            $dbHealthy = true;
        } catch (Throwable) {
            $dbHealthy = false;
        }

        try {
            $probeKey = 'health_probe_'.uniqid('', true);
            Cache::put($probeKey, 'ok', 5);
            $cacheHealthy = Cache::get($probeKey) === 'ok';
            Cache::forget($probeKey);
        } catch (Throwable) {
            $cacheHealthy = false;
        }

        $isHealthy = $dbHealthy && $cacheHealthy;

        return ApiResponse::success(
            data: [
                'service' => 'ai-home-tutor-bangladesh-api',
                'api_version' => 'v1',
                'status' => $isHealthy ? 'healthy' : 'degraded',
                'checks' => [
                    'database' => $dbHealthy ? 'up' : 'down',
                    'cache' => $cacheHealthy ? 'up' : 'down',
                ],
                'timestamp' => now()->toIso8601String(),
            ],
            message: 'সিস্টেম সচল রয়েছে।',
            status: $isHealthy ? 200 : 503,
        );
    }
}
