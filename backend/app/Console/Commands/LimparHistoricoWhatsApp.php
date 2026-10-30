<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LimparHistoricoWhatsApp extends Command
{
    protected $signature = 'whatsapp:limpar-historico';

    protected $description = 'Remove dados de rastreamento WhatsApp vencidos e falhas antigas da fila';

    public function handle(): int
    {
        $dias = max(1, (int) config('services.baileys.retention_days', 90));
        $limite = now()->subDays($dias);

        $notificacoesLimpa = DB::table('notificacoes')
            ->where('tipo', 'COMPROMISSO_HOJE')
            ->where('created_at', '<', $limite)
            ->whereNull('whatsapp_enfileirado_em')
            ->where(function ($query): void {
                $query->whereNotNull('whatsapp_status')
                    ->orWhereNotNull('whatsapp_message_id')
                    ->orWhereNotNull('whatsapp_erro')
                    ->orWhereNotNull('whatsapp_enviado_em')
                    ->orWhereNotNull('whatsapp_entregue_em')
                    ->orWhereNotNull('whatsapp_lido_em');
            })
            ->update([
                'whatsapp_status' => null,
                'whatsapp_message_id' => null,
                'whatsapp_erro' => null,
                'whatsapp_enviado_em' => null,
                'whatsapp_entregue_em' => null,
                'whatsapp_lido_em' => null,
            ]);

        $falhasDeFilaLimpa = 0;
        if (Schema::hasTable('failed_jobs')) {
            $falhasDeFilaLimpa = DB::table('failed_jobs')
                ->where('failed_at', '<', $limite)
                ->where('payload', 'like', '%EnviarNotificacaoWhatsAppJob%')
                ->delete();
        }

        $this->info("Rastreamento removido de {$notificacoesLimpa} notificações; {$falhasDeFilaLimpa} falhas antigas da fila removidas.");

        return self::SUCCESS;
    }
}
