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
        Schema::create('mastery_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('learning_objective_id')->constrained('learning_objectives')->restrictOnDelete();
            $table->decimal('mastery_score', 5, 2)->default(0.00);
            $table->string('mastery_status', 30)->default('unstarted')->index();
            $table->unsignedInteger('attempts_count')->default(0);
            $table->unsignedInteger('correct_count')->default(0);
            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamp('next_review_due_at')->nullable()->index();
            $table->timestamps();

            $table->unique(
                ['student_id', 'curriculum_version_id', 'learning_objective_id'],
                'uq_student_version_objective_mastery'
            );
        });

        Schema::create('mastery_evidence_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('mastery_record_id')->constrained('mastery_records')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('source_type', 40)->index();
            $table->unsignedBigInteger('source_id');
            $table->string('question_difficulty', 20)->default('medium');
            $table->decimal('score_ratio', 4, 3);
            $table->unsignedTinyInteger('hints_used')->default(0);
            $table->decimal('previous_mastery', 5, 2);
            $table->decimal('new_mastery', 5, 2);
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['student_id', 'recorded_at'], 'idx_mastery_evidence_student_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mastery_evidence_logs');
        Schema::dropIfExists('mastery_records');
    }
};
