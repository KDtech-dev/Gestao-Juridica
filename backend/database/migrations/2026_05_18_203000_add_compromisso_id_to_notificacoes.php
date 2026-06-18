<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificacoes', function (Blueprint $table) {
            $table->foreignUuid('compromisso_id')
                ->nullable()
                ->after('usuario_id')
                ->constrained('compromissos')
                ->cascadeOnDelete();
        });

        DB::table('notificacoes')
            ->whereNull('compromisso_id')
            ->whereNotNull('dados')
            ->orderBy('id')
            ->get(['id', 'dados'])
            ->each(function (object $notificacao): void {
                $dados = is_string($notificacao->dados)
                    ? json_decode($notificacao->dados, true)
                    : (array) $notificacao->dados;

                $compromissoId = $dados['compromisso_id'] ?? null;

                if (!$compromissoId) {
                    return;
                }

                $compromissoExiste = DB::table('compromissos')
                    ->where('id', $compromissoId)
                    ->exists();

                if (!$compromissoExiste) {
                    return;
                }

                DB::table('notificacoes')
                    ->where('id', $notificacao->id)
                    ->update(['compromisso_id' => $compromissoId]);
            });
    }

    public function down(): void
    {
        Schema::table('notificacoes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('compromisso_id');
        });
    }
};
