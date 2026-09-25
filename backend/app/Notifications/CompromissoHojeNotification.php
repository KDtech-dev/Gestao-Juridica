<?php

namespace App\Notifications;

use App\Models\Compromisso;
use App\Notifications\Channels\WhatsAppChannel;
use App\Notifications\Messages\WhatsAppMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CompromissoHojeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Compromisso $compromisso) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WhatsAppChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'compromisso_id' => $this->compromisso->id,
            'titulo' => $this->compromisso->titulo,
            'hora' => $this->compromisso->hora,
        ];
    }

    public function toWhatsApp(object $notifiable): WhatsAppMessage
    {
        return WhatsAppMessage::create()
            ->to($notifiable->telefone)
            ->content("O {$this->compromisso->titulo} está marcado para hoje às {$this->compromisso->hora}");
    }
}
