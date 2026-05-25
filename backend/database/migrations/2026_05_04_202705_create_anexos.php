<?php

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
        Schema::create('anexos', function (Blueprint $table) {
            $table->id();

            $table->uuid('anexavel_id')->nullable();
            $table->string('anexavel_type')->nullable();

            $table->string('descricao')->nullable();
            $table->string('arquivo')->nullable();
            $table->string('nome_arquivo')->nullable();
            $table->string('url')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index([
                'anexavel_id',
                'anexavel_type'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anexos');
    }
};
