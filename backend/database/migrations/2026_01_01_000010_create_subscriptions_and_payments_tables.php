<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 60)->unique();
            $table->string('name_bn', 120);
            $table->string('name_en', 120);
            $table->string('tier', 30)->index(); // free, basic, premium, family
            $table->unsignedInteger('price_bdt')->default(0);
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, yearly
            $table->unsignedInteger('daily_ai_turns_limit')->default(10);
            $table->unsignedInteger('monthly_exams_limit')->default(2);
            $table->unsignedTinyInteger('max_children_supported')->default(1);
            $table->json('features_json')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('guardian_id')->constrained('guardian_profiles')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('student_profiles')->nullOnDelete();
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->string('status', 30)->default('active')->index(); // active, past_due, cancelled, expired
            $table->timestamp('starts_at');
            $table->timestamp('expires_at')->index();
            $table->boolean('auto_renew')->default(true);
            $table->timestamps();

            $table->index(['guardian_id', 'status']);
            $table->index(['student_id', 'status']);
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('guardian_id')->constrained('guardian_profiles')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans')->restrictOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('student_profiles')->nullOnDelete();
            $table->string('gateway', 30)->index(); // bkash, nagad, sslcommerz
            $table->string('merchant_invoice_no', 80)->unique();
            $table->string('gateway_trx_id', 80)->nullable()->unique();
            $table->unsignedInteger('amount_bdt');
            $table->string('currency', 10)->default('BDT');
            $table->string('status', 30)->default('initiated')->index(); // initiated, completed, failed, refunded
            $table->string('idempotency_key', 100)->unique();
            $table->boolean('webhook_signature_verified')->default(false);
            $table->json('raw_webhook_payload_json')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
