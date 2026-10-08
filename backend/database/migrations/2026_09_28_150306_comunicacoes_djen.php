<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comunicacoes_djen', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('djen_id')->unique();
            $table->foreignUuid('caso_id')
                ->nullable()
                ->constrained('casos')
                ->nullOnDelete();
            $table->string('numero_processo', 25)->nullable()->index();
            $table->string('sigla_tribunal', 20)->nullable()->index();
            $table->string('nome_orgao')->nullable();
            $table->string('tipo_comunicacao')->nullable();
            $table->date('data_disponibilizacao')->nullable()->index();
            $table->longText('texto')->nullable();
            $table->string('link')->nullable();

            $table->json('payload')->nullable();

            $table->timestamp('lida_em')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comunicacoes_djen');
    }
};