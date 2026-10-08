<?php

namespace App\Console\Commands;

use App\Models\Advogado;
use App\Models\Caso;
use App\Services\DjenService;
use Illuminate\Console\Command;

class SincronizarDjenCommand extends Command
{
    protected $signature = 'djen:sincronizar';

    protected $description = 'Busca no DJEN as comunicações dos casos abertos';

    public function handle(DjenService $service): int
    {
        $falhas = 0;

        Caso::query()
            ->where('status', 'aberto')
            ->whereNotNull('numero_processo_limpo')
            ->each(function (Caso $caso) use ($service, &$falhas) {
                try {
                    $qtd = $service->sincronizarCaso($caso, now()->subDays(3));
                    $this->line("Caso {$caso->numero_processo}: {$qtd} comunicação(ões)");
                } catch (\Throwable $e) {
                    $falhas++;
                    report($e);
                    $this->error("Caso {$caso->numero_processo}: {$e->getMessage()}");
                }
            });


        Advogado::query()
            ->whereNotNull('oab_numero')
            ->whereNotNull('oab_uf')
            ->each(function (Advogado $advogado) use ($service, &$falhas) {
                try {
                    $qtd = $service->sincronizarAdvogado($advogado, now()->subDays(3));
                    $this->line("OAB {$advogado->oab_numero}/{$advogado->oab_uf}: {$qtd} comunicação(ões)");
                } catch (\Throwable $e) {
                    $falhas++;
                    report($e);
                    $this->error("OAB {$advogado->oab_numero}: {$e->getMessage()}");
                }
            });
        return $falhas ? self::FAILURE : self::SUCCESS;
    }
}
