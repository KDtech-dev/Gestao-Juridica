<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funcionarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            $table->date('data_nascimento')->nullable();
            $table->enum('sexo', [
                'masculino',
                'feminino',
                'outro',
                'prefiro_nao_dizer'
            ])->nullable();
            $table->string('celular', 20)->nullable();
            $table->text('resumo_pessoal')->nullable();
            $table->string('foto_perfil')->nullable();
            $table->uuid('endereco_id')->nullable();
            $table->foreign('endereco_id')
                ->references('id')
                ->on('enderecos')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funcionarios');
        Schema::dropIfExists('pessoas');
    }
};
