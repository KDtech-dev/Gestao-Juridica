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
            // $table->foreignId('publicacao_id')->nullable()->constrained('publicacoes')->nullOnDelete();
            //  $table->foreignId('casos_id')->nullable()->constrained('casos')->nullOnDelete();
            $table->string('descricao')->nullable();
            $table->string('arquivo')->nullable();
            $table->string('nome_arquivo')->nullable();
            $table->string('url')->nullable();
            $table->softDeletes();
            $table->timestamps();
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
