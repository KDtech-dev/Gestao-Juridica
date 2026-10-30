<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ConfiguracaoSistemaService;
use App\Services\NotificacaoService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class NotificarCompromissosDoDia extends Command
{
    protected $signature = 'compromissos:sincronizar-lembretes';
    protected $description = 'Sincroniza lembretes de compromissos (hoje/semana) e envia WhatsApp para os de hoje';

    public function handle(NotificacaoService $service, ConfiguracaoSistemaService $configuracoes): int
    {
        if (CarbonImmutable::now()->format('H:i') !== $configuracoes->horarioLembreteWhatsapp()) {
            return self::SUCCESS;
        }

        $enviarWhatsApp = $configuracoes->lembretesWhatsappAtivos();

        $fimDaSemana = CarbonImmutable::today()->endOfWeek();

        User::query()
            ->whereHas('compromissos', function ($query) use ($fimDaSemana) {
                $query->where('status', 'PENDENTE')
                    ->whereDate('data', '<=', $fimDaSemana->toDateString());
            })
            ->each(fn (User $usuario) => $service->sincronizarLembretesCompromissos(
                $usuario,
                enviarWhatsApp: $enviarWhatsApp,
            ));

        $this->info($enviarWhatsApp
            ? 'Lembretes sincronizados e envios WhatsApp enfileirados.'
            : 'Lembretes sincronizados; envios WhatsApp estão pausados.');

        return self::SUCCESS;
    }
}
