<?php

namespace App\Console\Commands;

use App\Models\Advogado;
use App\Models\Caso;
use App\Services\DjenSyncCoordinator;
use Illuminate\Console\Command;

class SincronizarDjenCommand extends Command
{
    protected $signature = 'djen:sincronizar';

    protected $description = 'Enfileira sincronizações DJEN para casos abertos e advogados';

    public function handle(DjenSyncCoordinator $coordinator): int
    {
        $enfileiradas = 0;
        $ignoradas = 0;

        Caso::query()->where('status', 'aberto')->whereNotNull('numero_processo_limpo')->each(
            function (Caso $caso) use ($coordinator, &$enfileiradas, &$ignoradas): void {
                try {
                    [$run, $created] = $coordinator->enqueue($caso);
                    $created ? $enfileiradas++ : $ignoradas++;
                    $this->line("Caso {$caso->numero_processo}: {$run->status} ({$run->id})");
                } catch (\Throwable $exception) {
                    $ignoradas++;
                    report($exception);
                    $this->warn("Caso {$caso->numero_processo}: {$exception->getMessage()}");
                }
            }
        );

        Advogado::query()->whereNotNull('oab_numero')->whereNotNull('oab_uf')->each(
            function (Advogado $advogado) use ($coordinator, &$enfileiradas, &$ignoradas): void {
                try {
                    [$run, $created] = $coordinator->enqueue($advogado);
                    $created ? $enfileiradas++ : $ignoradas++;
                    $this->line("OAB {$advogado->oab_numero}/{$advogado->oab_uf}: {$run->status} ({$run->id})");
                } catch (\Throwable $exception) {
                    $ignoradas++;
                    report($exception);
                    $this->warn("OAB {$advogado->oab_numero}: {$exception->getMessage()}");
                }
            }
        );

        $this->info("Enfileiradas: {$enfileiradas}; ignoradas ou já em andamento: {$ignoradas}.");
        return self::SUCCESS;
    }
}
