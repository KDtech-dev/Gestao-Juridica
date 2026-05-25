<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processos', function (Blueprint $table) {

            $table->uuid('id')->primary();
            $table->foreignUuid('cliente_id')
                ->constrained('clientes')
                ->cascadeOnDelete();
            $table->string('numero_processo')->unique();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('vara')->nullable();
            $table->string('comarca')->nullable();
            $table->string('tribunal')->nullable();
            $table->enum('status', [
                'ativo',
                'suspenso',
                'arquivado',
                'finalizado'
            ])->default('ativo');
            $table->date('data_abertura')->nullable();
            $table->date('data_encerramento')->nullable();
            $table->timestamps();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processos');
    }
};
