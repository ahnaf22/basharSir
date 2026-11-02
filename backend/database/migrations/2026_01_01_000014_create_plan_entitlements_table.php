<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_entitlements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans')->cascadeOnDelete();
            $table->string('feature_key', 80)->index();
            $table->boolean('is_enabled')->default(true);
            $table->integer('quota_limit')->nullable(); // null means unlimited or boolean feature
            $table->string('description_bn', 200)->nullable();
            $table->timestamps();

            $table->unique(['subscription_plan_id', 'feature_key'], 'uq_plan_feature');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_entitlements');
    }
};

