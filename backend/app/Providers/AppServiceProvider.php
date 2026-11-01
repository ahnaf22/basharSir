<?php

declare(strict_types=1);

namespace App\Providers;

use App\Modules\AI\Contracts\AiProviderInterface;
use App\Modules\AI\Providers\DeterministicCurriculumAiProvider;
use App\Modules\Notifications\Contracts\SmsGatewayInterface;
use App\Modules\Notifications\Services\LogSmsGateway;
use App\Modules\Students\Models\StudentProfile;
use App\Modules\Students\Policies\StudentOwnershipPolicy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LogSmsGateway::class, fn (): LogSmsGateway => new LogSmsGateway);
        $this->app->bind(SmsGatewayInterface::class, fn ($app): SmsGatewayInterface => $app->make(LogSmsGateway::class));
        $this->app->bind(
            AiProviderInterface::class,
            fn ($app): AiProviderInterface => $app->make(DeterministicCurriculumAiProvider::class)
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $isNotProduction = $this->app->environment() !== 'production';

        Model::preventLazyLoading($isNotProduction);
        Model::preventSilentlyDiscardingAttributes($isNotProduction);
        Model::preventAccessingMissingAttributes($isNotProduction);

        Gate::policy(StudentProfile::class, StudentOwnershipPolicy::class);
    }
}
