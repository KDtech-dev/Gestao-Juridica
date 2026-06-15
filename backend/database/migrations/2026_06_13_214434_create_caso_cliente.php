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
        Schema::create('caso_cliente', function (Blueprint $table) {
            $table->uuid('caso_id');
            $table->uuid('cliente_id');
            $table->string('papel')->default('autor'); 
            $table->primary(['caso_id', 'cliente_id']);
            $table->foreign('caso_id')->references('id')->on('casos')->cascadeOnDelete();
            $table->foreign('cliente_id')->references('id')->on('clientes')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caso_cliente');
    }
};
