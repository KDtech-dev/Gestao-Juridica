<?php

namespace App\Console\Commands;

use App\Models\WhatsAppWebhook;
use App\Services\WhatsApp\Outbox;
use App\Services\WhatsApp\Webhooks;
use Illuminate\Console\Command;

class DispatchWhatsApp extends Command
{
    protected $signature = 'whatsapp:dispatch';

    protected $description = 'Recupera webhooks e envios vencidos de WhatsApp';

    public function handle(Outbox $outbox, Webhooks $webhooks): int
    {
        // Process opt-outs before dispatching business sends, including while sending is disabled.
        WhatsAppWebhook::whereNull('processed_at')->orderBy('id')->each(fn ($e) => $webhooks->process($e->id));
        $outbox->sweep();
        $this->info('Pendências verificadas.');

        return self::SUCCESS;
    }
}
