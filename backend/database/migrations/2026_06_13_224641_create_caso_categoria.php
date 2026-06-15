<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caso_categoria', function (Blueprint $table) {
            $table->uuid('caso_id');
            $table->unsignedBigInteger('categoria_id');
            $table->primary(['caso_id', 'categoria_id']);
            $table->foreign('caso_id')->references('id')->on('casos')->cascadeOnDelete();
            $table->foreign('categoria_id')->references('id')->on('categorias')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caso_categoria');
    }
};
