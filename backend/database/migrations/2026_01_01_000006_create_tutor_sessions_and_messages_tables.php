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
        Schema::create('tutor_sessions', function (Blueprint $table): void {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('topic_id')->constrained('topics')->restrictOnDelete();
            $table->foreignId('active_objective_id')->constrained('learning_objectives')->restrictOnDelete();
            $table->string('current_stage', 40)->default('START_LESSON')->index();
            $table->string('session_status', 30)->default('active')->index();
            $table->text('compact_summary_text')->nullable();
            $table->json('state_metadata_json');
            $table->unsignedInteger('active_duration_seconds')->default(0);
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'session_status'], 'idx_tutor_sessions_student_status');
        });

        Schema::create('tutor_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tutor_session_id')->constrained('tutor_sessions')->cascadeOnDelete();
            $table->char('client_turn_id', 36)->unique();
            $table->string('sender_role', 20);
            $table->string('lesson_stage', 40);
            $table->string('student_action_type', 40)->nullable();
            $table->text('student_input_text')->nullable();
            $table->json('structured_payload_json')->nullable();
            $table->boolean('is_answer_correct')->nullable();
            $table->string('misconception_code', 80)->nullable();
            $table->unsignedTinyInteger('hints_used_count')->default(0);
            $table->foreignId('ai_request_id')->nullable()->constrained('ai_requests')->nullOnDelete();
            $table->timestamps();

            $table->index(['tutor_session_id', 'id'], 'idx_tutor_messages_session_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutor_messages');
        Schema::dropIfExists('tutor_sessions');
    }
};
