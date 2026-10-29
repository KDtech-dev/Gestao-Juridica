<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('djen_sync_runs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('target_type', 20);
            $table->uuid('target_id');
            $table->foreignUuid('initiated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('queued')->index();
            $table->date('from_date');
            $table->timestamp('checkpoint_at')->nullable();
            $table->unsignedSmallInteger('pages_completed')->default(0);
            $table->unsignedInteger('items_processed')->default(0);
            $table->unsignedInteger('items_created')->default(0);
            $table->unsignedInteger('items_updated')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['target_type', 'target_id', 'status']);
            $table->index(['target_type', 'target_id', 'checkpoint_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('djen_sync_runs');
    }
};
