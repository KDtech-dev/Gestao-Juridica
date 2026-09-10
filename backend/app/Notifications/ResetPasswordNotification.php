<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Redefinição de senha')
            ->line('Você solicitou a redefinição da sua senha.')
            ->action('Redefinir senha', $url)
            ->line('Este link expira em 60 minutos.')
            ->line('Se você não solicitou isso, pode ignorar este email.');
    }
}
