<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_lawyer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->unsignedBigInteger('lawyer_id');
            $table->timestamps();

            $table->foreign('lawyer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['appointment_id', 'lawyer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_lawyer');
    }
};
