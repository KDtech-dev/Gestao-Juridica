<?php

namespace App\Jobs;

use App\Services\WhatsApp\Sender;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWhatsAppMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 45;

    public function __construct(public string $messageId)
    {
        $this->afterCommit();
    }

    public function handle(Sender $sender): void
    {
        $sender->send($this->messageId);
    }
}
