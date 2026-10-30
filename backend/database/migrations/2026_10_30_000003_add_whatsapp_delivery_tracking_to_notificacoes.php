<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificacoes', function (Blueprint $table): void {
            $table->string('whatsapp_status', 20)->nullable()->index();
            $table->string('whatsapp_message_id', 150)->nullable()->index();
            $table->timestamp('whatsapp_entregue_em')->nullable();
            $table->timestamp('whatsapp_lido_em')->nullable();
        });

        DB::table('notificacoes')
            ->whereNotNull('whatsapp_enviado_em')
            ->update(['whatsapp_status' => 'sent']);

        DB::table('notificacoes')
            ->whereNotNull('whatsapp_enfileirado_em')
            ->whereNull('whatsapp_enviado_em')
            ->update(['whatsapp_status' => 'queued']);
    }

    public function down(): void
    {
        Schema::table('notificacoes', function (Blueprint $table): void {
            $table->dropIndex(['whatsapp_status']);
            $table->dropIndex(['whatsapp_message_id']);
            $table->dropColumn([
                'whatsapp_status',
                'whatsapp_message_id',
                'whatsapp_entregue_em',
                'whatsapp_lido_em',
            ]);
        });
    }
};
