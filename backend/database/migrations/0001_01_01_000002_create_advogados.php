<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advogados', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            $table->enum('sexo', [
                'masculino',
                'feminino',
                'outro',
                'prefiro_nao_dizer'
            ])->nullable();
            $table->string('celular', 20)->nullable();
            $table->text('resumo_pessoal')->nullable();
            $table->string('foto_perfil')->nullable();
            $table->string('oab_numero', 20)->unique();
            $table->string('oab_uf', 2);
            $table->json('especialidade')->nullable();
            $table->uuid('endereco_id')->nullable();
            $table->foreign('endereco_id')
                ->references('id')
                ->on('enderecos')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advogados');
    }
};
