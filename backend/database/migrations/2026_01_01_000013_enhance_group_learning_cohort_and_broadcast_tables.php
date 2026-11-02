<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_sessions', function (Blueprint $table): void {
            $table->string('join_code', 32)->nullable()->unique()->after('uuid');
            $table->unsignedTinyInteger('target_class_level')->default(8)->after('title_bn');
            $table->string('target_medium', 20)->default('bangla')->after('target_class_level');
            $table->string('teaching_mode', 40)->default('batch_mode')->after('status'); // batch_mode, individual_assistance
            $table->string('current_lesson_stage', 50)->default('EXPLAIN_CONCEPT')->after('teaching_mode');
            $table->text('shared_board_markdown_bn')->nullable()->after('current_lesson_stage');
        });

        Schema::table('group_participants', function (Blueprint $table): void {
            $table->boolean('is_kicked')->default(false)->after('pseudonym_bn');
            $table->string('moderation_reason_bn', 200)->nullable()->after('is_kicked');
        });

        Schema::table('raise_hand_events', function (Blueprint $table): void {
            $table->boolean('pii_redacted')->default(false)->after('question_summary_bn');
        });

        Schema::create('group_broadcast_questions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('group_session_id')->constrained('group_sessions')->cascadeOnDelete();
            $table->text('stem_bn');
            $table->json('options_json');
            $table->string('correct_option_key', 20);
            $table->text('explanation_bn');
            $table->boolean('is_revealed')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('group_broadcast_responses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('broadcast_question_id')->constrained('group_broadcast_questions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->string('selected_option_key', 20);
            $table->boolean('is_correct')->default(false);
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->unique(['broadcast_question_id', 'student_id'], 'uq_group_broadcast_student');
        });

        Schema::create('group_individual_assistances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('group_session_id')->constrained('group_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->text('student_question_bn');
            $table->text('ai_side_explanation_bn');
            $table->boolean('pii_redacted')->default(false);
            $table->timestamps();

            $table->index(['group_session_id', 'student_id'], 'idx_group_ind_assist_student');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_individual_assistances');
        Schema::dropIfExists('group_broadcast_responses');
        Schema::dropIfExists('group_broadcast_questions');

        Schema::table('raise_hand_events', function (Blueprint $table): void {
            $table->dropColumn('pii_redacted');
        });

        Schema::table('group_participants', function (Blueprint $table): void {
            $table->dropColumn(['is_kicked', 'moderation_reason_bn']);
        });

        Schema::table('group_sessions', function (Blueprint $table): void {
            $table->dropColumn([
                'join_code',
                'target_class_level',
                'target_medium',
                'teaching_mode',
                'current_lesson_stage',
                'shared_board_markdown_bn',
            ]);
        });
    }
};
