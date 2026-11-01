<?php

declare(strict_types=1);

namespace App\Core\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

final class ApiResponse
{
    /**
     * Build a standardized /api/v1 success JSON envelope.
     *
     * @param  array<string, mixed>|JsonResource|null  $data
     * @param  array<string, mixed>  $meta
     */
    public static function success(
        array|JsonResource|null $data = null,
        ?string $message = null,
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        $resolvedData = $data instanceof JsonResource
            ? $data->resolve(request())
            : $data;

        $payload = [
            'success' => true,
        ];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        $payload['data'] = $resolvedData;
        $payload['meta'] = self::buildMeta($meta);

        return response()->json($payload, $status);
    }

    /**
     * Build a standardized /api/v1 paginated collection JSON envelope.
     *
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  class-string<JsonResource>|null  $resourceClass
     * @param  array<string, mixed>  $meta
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        ?string $resourceClass = null,
        array $meta = [],
    ): JsonResponse {
        $items = $paginator->items();

        if ($resourceClass !== null) {
            $items = $resourceClass::collection($items)->resolve(request());
        }

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => array_merge(self::buildMeta($meta), [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]),
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ], 200);
    }

    /**
     * Build a standardized /api/v1 error JSON envelope.
     *
     * @param  array<string, mixed>  $details
     * @param  array<string, mixed>  $meta
     */
    public static function error(
        string $code,
        string $message,
        int $status = 400,
        array $details = [],
        array $meta = [],
    ): JsonResponse {
        $errorBlock = [
            'code' => $code,
            'message' => $message,
        ];

        if ($details !== []) {
            $errorBlock['details'] = $details;
        }

        return response()->json([
            'success' => false,
            'error' => $errorBlock,
            'meta' => self::buildMeta($meta),
        ], $status);
    }

    /**
     * Resolve correlation ID and curriculum version metadata.
     *
     * @param  array<string, mixed>  $extraMeta
     * @return array<string, mixed>
     */
    public static function buildMeta(array $extraMeta = []): array
    {
        $request = request();
        $correlationId = $request->attributes->get('correlation_id')
            ?? $request->header('X-Correlation-Id')
            ?? 'req_'.Str::upper(Str::ulid()->toBase32());

        return array_merge([
            'correlation_id' => (string) $correlationId,
            'curriculum_version' => (string) config('tutor.default_curriculum_version', 'NCTB-2026-BM-v1.0'),
        ], $extraMeta);
    }
}
