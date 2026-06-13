<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advogado_categoria', function (Blueprint $table) {
            $table->uuid('advogado_id');
            $table->unsignedBigInteger('categoria_id');
            $table->foreign('advogado_id')
                ->references('id')
                ->on('advogados')
                ->cascadeOnDelete();

            $table->foreign('categoria_id')
                ->references('id')
                ->on('categorias')
                ->cascadeOnDelete();

            $table->primary(['advogado_id', 'categoria_id']);
        });

        Schema::table('advogados', function (Blueprint $table) {
            $table->dropColumn('especialidade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advogado_categoria');

        Schema::table('advogados', function (Blueprint $table) {
            $table->json('especialidade')->nullable();
        });
    }
};
