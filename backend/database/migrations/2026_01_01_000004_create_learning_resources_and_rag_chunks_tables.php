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
        Schema::create('learning_resources', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->restrictOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->restrictOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->foreignId('learning_objective_id')->nullable()->constrained('learning_objectives')->nullOnDelete();
            $table->string('resource_type', 40)->index();
            $table->string('title_bn', 255);
            $table->longText('content_markdown');
            $table->json('media_assets_json')->nullable();
            $table->string('nctb_page_reference', 60)->nullable();
            $table->string('workflow_status', 30)->default('draft')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->string('vector_embedding_id', 100)->nullable();
            $table->timestamps();

            $table->index(['chapter_id', 'workflow_status'], 'idx_chapter_published_resources');
            $table->index(['learning_objective_id', 'workflow_status'], 'idx_objective_published_resources');
        });

        Schema::create('resource_rag_chunks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('learning_resource_id')->constrained('learning_resources')->cascadeOnDelete();
            $table->foreignId('curriculum_version_id')->constrained('curriculum_versions')->cascadeOnDelete();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->foreignId('learning_objective_id')->nullable()->constrained('learning_objectives')->nullOnDelete();
            $table->unsignedSmallInteger('chunk_index');
            $table->text('chunk_text');
            $table->unsignedSmallInteger('token_estimate');
            $table->json('embedding_vector_json')->nullable();
            $table->string('nctb_page_reference', 60)->nullable();
            $table->timestamps();

            $table->index(['learning_objective_id', 'chunk_index'], 'idx_rag_objective_chunks');
        });

        Schema::create('student_resource_annotations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('learning_resource_id')->constrained('learning_resources')->cascadeOnDelete();
            $table->boolean('is_bookmarked')->default(false)->index();
            $table->json('highlights_json')->nullable();
            $table->text('personal_note_markdown')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'learning_resource_id'], 'uq_student_resource_annotation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_resource_annotations');
        Schema::dropIfExists('resource_rag_chunks');
        Schema::dropIfExists('learning_resources');
    }
};
