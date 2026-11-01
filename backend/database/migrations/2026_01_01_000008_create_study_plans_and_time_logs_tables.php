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
        Schema::create('study_plans', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->string('title', 200);
            $table->date('target_completion_date');
            $table->unsignedSmallInteger('daily_study_minutes')->default(60);
            $table->string('status', 30)->default('active')->index();
            $table->decimal('completion_percentage', 5, 2)->default(0.00);
            $table->json('config_json');
            $table->timestamps();

            $table->index(['student_id', 'status'], 'idx_study_plans_student_status');
        });

        Schema::create('study_plan_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('study_plan_id')->constrained('study_plans')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->restrictOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->foreignId('learning_objective_id')->nullable()->constrained('learning_objectives')->nullOnDelete();
            $table->string('task_type', 40);
            $table->string('title_bn', 255);
            $table->date('scheduled_date')->index();
            $table->unsignedSmallInteger('planned_minutes')->default(30);
            $table->unsignedSmallInteger('actual_active_minutes')->default(0);
            $table->string('status', 30)->default('scheduled')->index();
            $table->date('rescheduled_from_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'scheduled_date'], 'idx_study_items_student_date');
        });

        Schema::create('study_time_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->date('study_date')->index();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('source_type', 40);
            $table->unsignedBigInteger('source_id');
            $table->timestamp('session_start_at');
            $table->timestamp('last_heartbeat_at');
            $table->timestamp('session_end_at')->nullable();
            $table->unsignedInteger('active_seconds')->default(0);
            $table->unsignedInteger('paused_seconds')->default(0);
            $table->unsignedSmallInteger('questions_attempted')->default(0);
            $table->timestamps();

            $table->index(['student_id', 'study_date'], 'idx_study_time_student_date');
            $table->index(['student_id', 'source_type', 'source_id'], 'idx_study_time_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_time_logs');
        Schema::dropIfExists('study_plan_items');
        Schema::dropIfExists('study_plans');
    }
};
