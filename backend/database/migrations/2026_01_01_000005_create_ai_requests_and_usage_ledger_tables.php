<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prompt_versions', function (Blueprint $table): void {
            $table->id();
            $table->string('service_name', 60)->index();
            $table->string('version_code', 60)->unique();
            $table->text('system_prompt_template');
            $table->string('model_tier', 30)->default('frontier');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['service_name', 'is_active'], 'idx_prompt_service_active');
        });

        Schema::create('ai_requests', function (Blueprint $table): void {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('student_id')->nullable()->constrained('student_profiles')->nullOnDelete();
            $table->unsignedBigInteger('subscription_id')->nullable()->index();
            $table->string('ai_service', 60)->index();
            $table->string('provider', 40)->index();
            $table->string('model_name', 80);
            $table->foreignId('prompt_version_id')->nullable()->constrained('prompt_versions')->nullOnDelete();
            $table->char('sanitized_prompt_hash', 64);
            $table->unsignedSmallInteger('pii_redacted_count')->default(0);
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->decimal('estimated_cost_usd', 10, 6)->default(0.000000);
            $table->decimal('estimated_cost_bdt', 10, 4)->default(0.0000);
            $table->unsignedInteger('latency_ms')->default(0);
            $table->string('status', 40)->default('completed')->index();
            $table->string('error_code', 100)->nullable();
            $table->timestamps();

            $table->index(['student_id', 'created_at'], 'idx_ai_requests_student_created');
        });

        Schema::create('usage_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->date('usage_date')->index();
            $table->unsignedInteger('ai_turns_used')->default(0);
            $table->unsignedInteger('script_ocr_used')->default(0);
            $table->unsignedBigInteger('total_input_tokens')->default(0);
            $table->unsignedBigInteger('total_output_tokens')->default(0);
            $table->decimal('total_cost_bdt', 10, 4)->default(0.0000);
            $table->timestamps();

            $table->unique(['student_id', 'usage_date'], 'uq_usage_ledger_student_date');
        });

        Schema::create('ai_quality_flags', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ai_request_id')->nullable()->constrained('ai_requests')->nullOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('source_type', 40)->index();
            $table->unsignedBigInteger('source_id')->index();
            $table->string('reason_code', 60);
            $table->text('student_comment')->nullable();
            $table->string('status', 30)->default('open')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_quality_flags');
        Schema::dropIfExists('usage_ledger');
        Schema::dropIfExists('ai_requests');
        Schema::dropIfExists('prompt_versions');
    }
};
