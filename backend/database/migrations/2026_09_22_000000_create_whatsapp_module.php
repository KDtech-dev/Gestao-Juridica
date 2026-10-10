<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->boolean('is_active')->default(true));
        Schema::table('compromissos', fn (Blueprint $t) => $t->uuid('whatsapp_revision')->nullable());
        Schema::create('whatsapp_preferences', function (Blueprint $t) {
            $t->id();
            $t->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('phone', 16)->nullable()->unique();
            $t->timestamp('verified_at')->nullable();
            $t->string('verification_mode')->nullable();
            $t->string('verification_hash', 64)->nullable();
            $t->timestamp('verification_expires_at')->nullable();
            $t->timestamp('consented_at')->nullable();
            $t->timestamp('revoked_at')->nullable();
            $t->boolean('daily_enabled')->default(false);
            $t->boolean('events_enabled')->default(false);
            $t->string('daily_time', 5)->default('08:00');
            $t->string('timezone')->default('America/Sao_Paulo');
            $t->string('locale', 5)->default('pt');
            $t->json('reminder_minutes')->nullable();
            $t->timestamps();
        });
        Schema::create('whatsapp_messages', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('dedupe_key', 64)->unique();
            $t->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            // Keep cancellation intents after an appointment is removed from the trash.
            $t->uuid('compromisso_id')->nullable()->index();
            $t->uuid('revision')->nullable();
            $t->string('kind', 24);
            $t->string('mode', 16);
            $t->string('phone', 16);
            $t->string('phone_number_id')->nullable();
            $t->string('waba_id')->nullable();
            $t->string('state', 24)->default('pending');
            $t->date('local_date')->nullable();
            $t->unsignedInteger('reminder_minutes')->nullable();
            $t->timestamp('due_at');
            $t->timestamp('expires_at');
            $t->timestamp('next_attempt_at');
            $t->timestamp('claimed_at')->nullable();
            $t->unsignedSmallInteger('attempts')->default(0);
            $t->string('meta_id')->nullable()->unique();
            $t->string('error_code')->nullable();
            $t->json('preview')->nullable();
            $t->timestamps();
            $t->index(['state', 'next_attempt_at']);
        });
        Schema::create('whatsapp_webhooks', function (Blueprint $t) {
            $t->id();
            $t->string('event_key', 64)->unique();
            $t->longText('payload');
            $t->timestamp('processed_at')->nullable()->index();
            $t->timestamps();
        });
        Schema::create('whatsapp_delivery_events', function (Blueprint $t) {
            $t->id();
            $t->foreignUuid('message_id')->constrained('whatsapp_messages')->cascadeOnDelete();
            $t->string('event_key', 64)->unique();
            $t->string('state', 24);
            $t->timestamp('occurred_at');
            $t->string('error_code')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_delivery_events');
        Schema::dropIfExists('whatsapp_webhooks');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_preferences');
        Schema::table('compromissos', fn (Blueprint $t) => $t->dropColumn('whatsapp_revision'));
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('is_active'));
    }
};
