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
        Schema::create('academic_years', function (Blueprint $table): void {
            $table->id();
            $table->string('year_code', 16)->unique();
            $table->string('title_bn', 120);
            $table->date('starts_on');
            $table->date('ends_on');
            $table->boolean('is_current')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('curriculum_versions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('version_code', 50)->unique();
            $table->string('board', 30)->default('NCTB');
            $table->string('medium', 30)->default('bangla')->index();
            $table->string('status', 30)->default('draft')->index();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->text('changelog_notes')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('classes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->unsignedTinyInteger('grade_level')->index();
            $table->string('education_stage', 30);
            $table->string('title_bn', 100);
            $table->string('title_en', 100);
            $table->json('teaching_persona_config')->nullable();
            $table->timestamps();

            $table->unique(['curriculum_version_id', 'grade_level'], 'uq_curriculum_grade_level');
        });

        Schema::create('subjects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->restrictOnDelete();
            $table->string('nctb_subject_code', 20);
            $table->string('title_bn', 150);
            $table->string('title_en', 150);
            $table->string('slug', 100);
            $table->json('exam_structure_json')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique(['class_id', 'slug'], 'uq_class_subject_slug');
        });

        Schema::create('chapters', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->unsignedSmallInteger('chapter_number');
            $table->string('title_bn', 200);
            $table->string('title_en', 200);
            $table->string('syllabus_status', 40)->default('included')->index();
            $table->unsignedSmallInteger('estimated_study_minutes')->default(120);
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();

            $table->unique(['subject_id', 'chapter_number'], 'uq_subject_chapter_number');
        });

        Schema::create('topics', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->restrictOnDelete();
            $table->string('topic_number', 20);
            $table->string('title_bn', 200);
            $table->string('title_en', 200);
            $table->unsignedSmallInteger('estimated_minutes')->default(45);
            $table->string('difficulty_level', 20)->default('medium');
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();

            $table->unique(['chapter_id', 'topic_number'], 'uq_chapter_topic_number');
        });

        Schema::create('learning_objectives', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('topic_id')->constrained('topics')->restrictOnDelete();
            $table->string('code', 60)->unique();
            $table->string('title_bn', 300);
            $table->string('title_en', 300);
            $table->string('bloom_level', 30)->default('comprehension');
            $table->unsignedTinyInteger('mastery_threshold_pct')->default(75);
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();
        });

        Schema::create('objective_prerequisites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('learning_objective_id')
                ->constrained('learning_objectives')
                ->cascadeOnDelete();
            $table->foreignId('prerequisite_objective_id')
                ->constrained('learning_objectives')
                ->cascadeOnDelete();
            $table->boolean('is_strict')->default(true);
            $table->timestamps();

            $table->unique(
                ['learning_objective_id', 'prerequisite_objective_id'],
                'uq_objective_prerequisite_pair'
            );
        });

        Schema::create('academic_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('class_id')->constrained('classes')->restrictOnDelete();
            $table->timestamp('enrolled_at');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique(['student_id', 'curriculum_version_id'], 'uq_student_curriculum_enrollment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_enrollments');
        Schema::dropIfExists('objective_prerequisites');
        Schema::dropIfExists('learning_objectives');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('curriculum_versions');
        Schema::dropIfExists('academic_years');
    }
};
