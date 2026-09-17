<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['users', 'publicacoes', 'compromissos', 'notificacoes'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->softDeletes());
        }
        Schema::create('exclusoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('tipo');
            $table->string('registro_id')->nullable();
            $table->string('descricao');
            // Intentionally not foreign keys: the audit survives account removal.
            $table->uuid('excluido_por')->nullable();
            $table->timestamp('expira_em')->index();
            $table->timestamp('restaurado_em')->nullable();
            $table->uuid('restaurado_por')->nullable();
            $table->timestamp('eliminado_em')->nullable();
            $table->longText('conteudo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exclusoes');
        foreach (['users', 'publicacoes', 'compromissos', 'notificacoes'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropSoftDeletes());
        }
    }
};
