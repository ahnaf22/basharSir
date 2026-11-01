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
        Schema::create('questions', function (Blueprint $table): void {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->restrictOnDelete();
            $table->foreignId('topic_id')->constrained('topics')->restrictOnDelete();
            $table->foreignId('learning_objective_id')->constrained('learning_objectives')->restrictOnDelete();
            $table->string('question_type', 40)->index();
            $table->string('difficulty', 20)->default('medium')->index();
            $table->decimal('marks', 4, 2)->default(1.00);
            $table->longText('stem_markdown');
            $table->json('options_json')->nullable();
            $table->json('sub_questions_json')->nullable();
            $table->json('deterministic_answer_key_json')->nullable();
            $table->string('status', 30)->default('published')->index();
            $table->timestamps();

            $table->index(['chapter_id', 'question_type', 'status'], 'idx_questions_chapter_type_status');
        });

        Schema::create('marking_rubrics', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id')->unique()->constrained('questions')->cascadeOnDelete();
            $table->longText('expected_answer_markdown');
            $table->json('step_wise_marks_json');
            $table->json('required_points_json')->nullable();
            $table->json('accepted_alternatives_json')->nullable();
            $table->json('common_mistakes_json')->nullable();
            $table->string('nctb_reference', 120)->nullable();
            $table->timestamps();
        });

        Schema::create('exams', function (Blueprint $table): void {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->foreignId('created_by_student_id')->nullable()->constrained('student_profiles')->nullOnDelete();
            $table->string('exam_type', 40)->index();
            $table->string('title_bn', 255);
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->decimal('total_marks', 5, 2);
            $table->json('question_blueprint_json');
            $table->timestamps();
        });

        Schema::create('exam_attempts', function (Blueprint $table): void {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('exam_id')->constrained('exams')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('status', 40)->default('in_progress')->index();
            $table->timestamp('started_at');
            $table->timestamp('expires_at');
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('obtained_marks', 5, 2)->default(0.00);
            $table->decimal('percentage_score', 5, 2)->default(0.00);
            $table->timestamps();

            $table->index(['student_id', 'status'], 'idx_exam_attempts_student_status');
        });

        Schema::create('submitted_answers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->restrictOnDelete();
            $table->string('answer_mode', 40)->default('mcq_choice');
            $table->string('selected_option_key', 20)->nullable();
            $table->longText('typed_answer_text')->nullable();
            $table->boolean('is_flagged_for_review')->default(false);
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->timestamps();

            $table->unique(['exam_attempt_id', 'question_id'], 'uq_attempt_question_answer');
        });

        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('submitted_answer_id')->unique()->constrained('submitted_answers')->cascadeOnDelete();
            $table->string('evaluator_type', 40)->index();
            $table->decimal('marks_awarded', 4, 2)->default(0.00);
            $table->decimal('max_marks', 4, 2)->default(1.00);
            $table->decimal('confidence_score', 4, 3)->default(1.000);
            $table->string('review_status', 40)->default('auto_approved')->index();
            $table->json('step_breakdown_json')->nullable();
            $table->text('feedback_bn')->nullable();
            $table->string('nctb_citation', 120)->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('submitted_answers');
        Schema::dropIfExists('exam_attempts');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('marking_rubrics');
        Schema::dropIfExists('questions');
    }
};
