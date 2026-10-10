<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\WhatsAppPreference;
use App\Services\WhatsApp\Outbox;
use Illuminate\Console\Command;

class SimulateWhatsAppVerification extends Command
{
    protected $signature = 'whatsapp:simulate-verification {email}';

    protected $description = 'Verifica apenas para simulação local; não autoriza envios reais';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing']) || config('whatsapp.mode') !== 'simulation') {
            $this->error('Disponível somente em simulação local/testes.');

            return self::FAILURE;
        }
        $u = User::where('email', $this->argument('email'))->firstOrFail();
        $p = WhatsAppPreference::where('user_id', $u->id)->whereNotNull('phone')->firstOrFail();
        $p->update(['verified_at' => Outbox::now(), 'verification_mode' => 'simulation']);
        $this->info('Verificação simulada; envios reais continuam exigindo verificação pelo webhook.');

        return self::SUCCESS;
    }
}
