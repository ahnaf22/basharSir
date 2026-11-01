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
        Schema::create('student_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('student_code', 24)->unique();
            $table->unsignedTinyInteger('current_class_level')->index();
            $table->string('medium', 30)->default('bangla')->index();
            $table->string('school_name', 200)->nullable();
            $table->string('district', 80)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('consent_status', 30)->default('pending')->index();
            $table->unsignedSmallInteger('daily_study_target_mins')->default(60);
            $table->string('pseudonym', 80)->nullable();
            $table->string('guardian_phone_invited', 20)->nullable()->index();
            $table->timestamps();
        });

        Schema::create('guardian_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('relation_type', 30)->default('legal_guardian');
            $table->string('preferred_language', 10)->default('bn');
            $table->string('weekly_report_channel', 30)->default('sms');
            $table->timestamps();
        });

        Schema::create('otp_verifications', function (Blueprint $table): void {
            $table->id();
            $table->string('phone', 20)->index();
            $table->string('purpose', 40)->index();
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at')->index();
            $table->timestamp('verified_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_verifications');
        Schema::dropIfExists('guardian_profiles');
        Schema::dropIfExists('student_profiles');
    }
};
