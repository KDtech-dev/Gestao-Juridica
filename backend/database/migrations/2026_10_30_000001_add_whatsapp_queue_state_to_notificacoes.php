<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $addEnviadoEm = !Schema::hasColumn('notificacoes', 'whatsapp_enviado_em');
        $addEnfileiradoEm = !Schema::hasColumn('notificacoes', 'whatsapp_enfileirado_em');
        $addErro = !Schema::hasColumn('notificacoes', 'whatsapp_erro');

        Schema::table('notificacoes', function (Blueprint $table) use ($addEnviadoEm, $addEnfileiradoEm, $addErro): void {
            if ($addEnviadoEm) {
                $table->timestamp('whatsapp_enviado_em')->nullable();
            }

            if ($addEnfileiradoEm) {
                $table->timestamp('whatsapp_enfileirado_em')->nullable();
            }

            if ($addErro) {
                $table->text('whatsapp_erro')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('notificacoes', function (Blueprint $table): void {
            $table->dropColumn(['whatsapp_enfileirado_em', 'whatsapp_erro']);
        });
    }
};
