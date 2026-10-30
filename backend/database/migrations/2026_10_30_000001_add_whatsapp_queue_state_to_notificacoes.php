<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificacoes', function (Blueprint $table): void {
            $table->timestamp('whatsapp_enfileirado_em')->nullable()->after('whatsapp_enviado_em');
            $table->text('whatsapp_erro')->nullable()->after('whatsapp_enfileirado_em');
        });
    }

    public function down(): void
    {
        Schema::table('notificacoes', function (Blueprint $table): void {
            $table->dropColumn(['whatsapp_enfileirado_em', 'whatsapp_erro']);
        });
    }
};
