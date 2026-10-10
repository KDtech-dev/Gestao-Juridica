<?php

namespace App\Jobs;

use App\Services\WhatsApp\Webhooks;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessWhatsAppWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function backoff(): array
    {
        return [30, 120, 600];
    }

    public function __construct(public int $eventId)
    {
        $this->afterCommit();
    }

    public function handle(Webhooks $webhooks): void
    {
        $webhooks->process($this->eventId);
    }
}
