<?php

namespace App\Jobs;

use App\Models\Notificacao;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class EnviarNotificacaoWhatsAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly string $notificacaoId,
        public readonly string $telefone,
        public readonly string $mensagem,
    ) {
        $this->onQueue('whatsapp');
    }

    public function backoff(): array
    {
        return [10, 30, 90];
    }

    public function handle(WhatsAppService $whatsApp): void
    {
        $notificacao = Notificacao::query()->find($this->notificacaoId);

        if (!$notificacao || $notificacao->whatsapp_enviado_em) {
            return;
        }

        $messageId = $whatsApp->enviar($this->telefone, $this->mensagem);
        $notificacao->update([
            'whatsapp_enviado_em' => now(),
            'whatsapp_enfileirado_em' => null,
            'whatsapp_erro' => null,
            'whatsapp_status' => 'sent',
            'whatsapp_message_id' => $messageId,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Notificacao::query()
            ->whereKey($this->notificacaoId)
            ->whereNull('whatsapp_enviado_em')
            ->update([
                'whatsapp_enfileirado_em' => null,
                'whatsapp_erro' => mb_substr($exception->getMessage(), 0, 4000),
                'whatsapp_status' => 'failed',
            ]);

        Log::warning('Falha ao enviar notificação via WhatsApp após novas tentativas', [
            'notificacao_id' => $this->notificacaoId,
            'erro' => $exception->getMessage(),
        ]);
    }
}
