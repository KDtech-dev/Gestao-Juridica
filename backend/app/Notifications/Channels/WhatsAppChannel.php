<?php

namespace App\Notifications\Channels;

use App\Services\WhatsAppService;
use Illuminate\Notifications\Notification;

class WhatsAppChannel
{
    public function __construct(protected WhatsAppService $service) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);
        $telefone = $message->to ?? $notifiable->telefone ?? null;

        if (empty($telefone)) {
            return;
        }

        $this->service->enviar($telefone, $message->content);
    }
}
