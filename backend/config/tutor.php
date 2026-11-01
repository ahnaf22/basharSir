<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Default NCTB Curriculum Version
    |--------------------------------------------------------------------------
    |
    | Default curriculum version identifier returned in API response metadata
    | when a request is not scoped to a specific historical curriculum version.
    |
    */
    'default_curriculum_version' => env('TUTOR_DEFAULT_CURRICULUM_VERSION', 'NCTB-2026-BM-v1.0'),

    /*
    |--------------------------------------------------------------------------
    | Initial Target Classes & Medium
    |--------------------------------------------------------------------------
    */
    'supported_mediums' => ['bangla'],
    'initial_pilot_classes' => [6, 7, 8],
    'all_classes' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
];
