<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('script_uploads', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('exam_attempt_id')->nullable()->constrained('exam_attempts')->nullOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('page_count')->default(1);
            $table->json('pages_meta_json');
            $table->decimal('image_quality_score', 4, 2)->default(0.90);
            $table->boolean('orientation_valid')->default(true);
            $table->text('ocr_text_bn')->nullable();
            $table->decimal('ocr_confidence_score', 4, 2)->default(0.00);
            $table->decimal('rubric_confidence_score', 4, 2)->default(0.00);
            $table->decimal('awarded_marks', 6, 2)->default(0.00);
            $table->decimal('max_marks', 6, 2)->default(0.00);
            $table->json('rubric_breakdown_json')->nullable();
            $table->string('status', 40)->default('uploaded')->index(); // uploaded, auto_graded, escalated_to_human, human_reviewed
            $table->foreignId('reviewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reviewer_notes_bn')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
        });

        Schema::create('group_sessions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('learning_objective_id')->constrained('learning_objectives')->cascadeOnDelete();
            $table->string('title_bn', 200);
            $table->unsignedTinyInteger('min_participants')->default(3);
            $table->unsignedTinyInteger('max_participants')->default(5);
            $table->string('status', 30)->default('scheduled')->index(); // scheduled, live, completed
            $table->timestamp('scheduled_at');
            $table->timestamps();
        });

        Schema::create('group_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('group_session_id')->constrained('group_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('pseudonym_bn', 80);
            $table->timestamp('joined_at');
            $table->timestamps();

            $table->unique(['group_session_id', 'student_id'], 'uq_group_session_student');
        });

        Schema::create('raise_hand_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('group_session_id')->constrained('group_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('question_summary_bn', 300);
            $table->string('status', 30)->default('queued')->index(); // queued, answered, dismissed
            $table->unsignedInteger('queue_position')->default(1);
            $table->text('ai_or_teacher_response_bn')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['group_session_id', 'status', 'queue_position'], 'idx_raise_hand_fifo');
        });

        Schema::create('xp_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('source_type', 50)->index(); // tutor_lesson_completed, exam_completed, daily_goal_met
            $table->unsignedBigInteger('source_id')->index();
            $table->unsignedInteger('xp_points');
            $table->string('reason_bn', 200);
            $table->date('earned_date')->index();
            $table->timestamps();

            $table->unique(['student_id', 'source_type', 'source_id'], 'uq_xp_ledger_source');
        });

        Schema::create('student_streaks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('student_profiles')->cascadeOnDelete();
            $table->unsignedInteger('current_streak_days')->default(0);
            $table->unsignedInteger('longest_streak_days')->default(0);
            $table->unsignedTinyInteger('streak_freezes_available')->default(1);
            $table->date('last_active_date')->nullable();
            $table->boolean('leaderboard_opt_in')->default(true)->index();
            $table->string('leaderboard_pseudonym_bn', 80)->nullable();
            $table->timestamps();
        });

        Schema::create('student_badges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('badge_code', 60);
            $table->string('title_bn', 120);
            $table->timestamp('awarded_at');
            $table->timestamps();

            $table->unique(['student_id', 'badge_code'], 'uq_student_badge_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_badges');
        Schema::dropIfExists('student_streaks');
        Schema::dropIfExists('xp_ledger');
        Schema::dropIfExists('raise_hand_events');
        Schema::dropIfExists('group_participants');
        Schema::dropIfExists('group_sessions');
        Schema::dropIfExists('script_uploads');
    }
};
