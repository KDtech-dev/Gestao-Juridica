<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {

            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('cpf_cnpj')->unique();
            $table->string('email')->nullable();
            $table->string('telefone')->nullable();
            $table->uuid('endereco_id')->nullable();
            $table->foreign('endereco_id')
                ->references('id')
                ->on('enderecos')
                ->nullOnDelete();
            $table->date('data_nascimento')->nullable();
            $table->string('foto_perfil')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
