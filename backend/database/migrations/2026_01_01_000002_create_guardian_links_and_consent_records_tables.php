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
        Schema::create('student_guardian_links', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('guardian_id')->constrained('guardian_profiles')->cascadeOnDelete();
            $table->boolean('is_primary_payer')->default(true);
            $table->string('status', 30)->default('invited')->index();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'guardian_id'], 'uq_student_guardian_link');
        });

        Schema::create('consent_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('guardian_id')->constrained('guardian_profiles')->cascadeOnDelete();
            $table->string('policy_version', 40)->default('PDPA-2026-v1');
            $table->json('consent_scope_json');
            $table->string('verification_method', 30)->default('otp_sms');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('consented_at');
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'withdrawn_at'], 'idx_student_active_consent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consent_records');
        Schema::dropIfExists('student_guardian_links');
    }
};
