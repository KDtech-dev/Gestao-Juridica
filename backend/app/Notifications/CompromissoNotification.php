<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class CompromissoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public $compromisso) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'COMPROMISSO',
            'title' => 'Novo compromisso',
            'message' => $this->compromisso->titulo,
            'compromisso_id' => $this->compromisso->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'COMPROMISSO',
            'title' => 'Novo compromisso',
            'message' => $this->compromisso->titulo,
            'compromisso_id' => $this->compromisso->id,
        ]);
    }
}
