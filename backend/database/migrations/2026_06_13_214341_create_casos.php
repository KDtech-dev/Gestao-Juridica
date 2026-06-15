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
        Schema::create('casos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('numero_processo')->unique()->nullable();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('status')->default('aberto'); 
            $table->string('area_direito')->nullable(); 
            $table->date('data_abertura');
            $table->date('data_encerramento')->nullable();
            $table->uuid('advogado_id')->nullable();
            $table->foreign('advogado_id')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('casos');
    }
};
