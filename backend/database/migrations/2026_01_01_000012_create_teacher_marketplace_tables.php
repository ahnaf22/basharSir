<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('teacher_code', 50)->unique();
            $table->string('full_name_bn', 150);
            $table->string('full_name_en', 150);
            $table->string('university_and_degree_bn', 250);
            $table->json('specializations_json');
            $table->unsignedInteger('hourly_rate_bdt')->default(500);
            $table->string('vetting_status', 30)->default('pending_review')->index(); // pending_review, verified, rejected
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('teacher_bookings', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('teacher_id')->constrained('teacher_profiles')->restrictOnDelete();
            $table->foreignId('guardian_id')->constrained('guardian_profiles')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('learning_objective_id')->constrained('learning_objectives')->restrictOnDelete();
            $table->string('session_mode', 30)->default('one_on_one'); // one_on_one, small_batch
            $table->timestamp('scheduled_at');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->unsignedInteger('agreed_fee_bdt');
            $table->unsignedInteger('platform_commission_bdt');
            $table->unsignedInteger('teacher_payout_bdt');
            $table->string('escrow_status', 30)->default('held_in_escrow')->index(); // held_in_escrow, released, refunded
            $table->json('ai_diagnostic_brief_json');
            $table->string('status', 30)->default('booked')->index(); // booked, completed, cancelled
            $table->timestamps();

            $table->index(['teacher_id', 'status']);
            $table->index(['student_id', 'status']);
        });

        Schema::create('script_review_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('script_upload_id')->unique()->constrained('script_uploads')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teacher_profiles')->restrictOnDelete();
            $table->unsignedInteger('reward_bdt')->default(50);
            $table->timestamp('sla_due_at')->index();
            $table->string('status', 30)->default('assigned')->index(); // assigned, completed, expired
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('script_review_assignments');
        Schema::dropIfExists('teacher_bookings');
        Schema::dropIfExists('teacher_profiles');
    }
};
