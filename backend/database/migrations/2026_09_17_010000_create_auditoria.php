<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auditoria_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('usuario_id')->nullable()->index();
            $table->string('usuario_nome')->nullable();
            $table->json('perfis')->nullable();
            $table->string('acao', 40)->index();
            $table->string('modulo', 60)->index();
            $table->string('metodo', 10);
            $table->string('rota');
            $table->json('registros')->nullable();
            $table->unsignedSmallInteger('status_http')->index();
            $table->timestamp('ocorrido_em')->index();
        });
        Schema::create('auditoria_arquivos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamp('inicio_em')->unique();
            $table->timestamp('fim_em');
            $table->string('caminho');
            $table->unsignedBigInteger('quantidade');
            $table->string('sha256', 64);
            $table->timestamp('criado_em');
        });
        Schema::create('auditoria_ciclos', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->timestamp('inicio_em');
        });
        DB::table('auditoria_ciclos')->insert(['id' => 1, 'inicio_em' => now()]);
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria_ciclos');
        Schema::dropIfExists('auditoria_arquivos');
        Schema::dropIfExists('auditoria_logs');
    }
};
