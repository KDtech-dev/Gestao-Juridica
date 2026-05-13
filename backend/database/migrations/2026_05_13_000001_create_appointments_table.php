<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by_id')->nullable();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->string('client_name')->nullable();
            $table->string('title');
            $table->string('type')->default('presencial');
            $table->string('location')->nullable();
            $table->string('video_url')->nullable();
            $table->dateTime('starts_at');
            $table->string('status')->default('Pendente');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('created_by_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('client_id')->references('id')->on('users')->nullOnDelete();
            $table->index('starts_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
