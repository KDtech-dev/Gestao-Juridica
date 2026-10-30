<?php

namespace App\Jobs;

use App\Models\Notificacao;
use App\Exceptions\WhatsAppEnvioFalhouException;
use App\Services\WhatsAppService;
use App\Services\ConfiguracaoSistemaService;
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

    /** Uma tentativa inicial e até três novas tentativas temporárias. */
    public int $tries = 4;

    public function __construct(
        public readonly string $notificacaoId,
    ) {
        $this->onQueue('whatsapp');
    }

    public function backoff(): array
    {
        return [15, 60, 180];
    }

    public function handle(WhatsAppService $whatsApp, ConfiguracaoSistemaService $configuracoes): void
    {
        $notificacao = Notificacao::query()->find($this->notificacaoId);

        if (!$notificacao || $notificacao->whatsapp_enviado_em) {
            return;
        }

        if ($notificacao->whatsapp_status !== 'queued') {
            return;
        }

        if (!$configuracoes->lembretesWhatsappAtivos()) {
            $notificacao->update([
                'whatsapp_enfileirado_em' => null,
                'whatsapp_erro' => null,
                'whatsapp_status' => 'paused',
            ]);

            return;
        }

        $notificacao->loadMissing(['usuario.funcionario', 'usuario.advogado']);
        $telefone = $notificacao->usuario?->funcionario?->celular
            ?? $notificacao->usuario?->advogado?->celular;

        if (!$telefone) {
            throw new WhatsAppEnvioFalhouException('O responsável pelo compromisso não tem celular cadastrado.', false);
        }

        try {
            $messageId = $whatsApp->enviar($telefone, $notificacao->mensagem);
        } catch (WhatsAppEnvioFalhouException $exception) {
            if (!$exception->retryable) {
                $this->fail($exception);
                return;
            }

            throw $exception;
        }
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
