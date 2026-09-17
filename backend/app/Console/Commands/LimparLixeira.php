<?php

namespace App\Console\Commands;

use App\Services\LixeiraService;
use Illuminate\Console\Command;

class LimparLixeira extends Command
{
    protected $signature = 'lixeira:limpar';

    protected $description = 'Elimina conteúdo da lixeira após 30 dias e mantém o registro de auditoria';

    public function handle(LixeiraService $service): int
    {
        $this->info($service->limpar().' item(ns) eliminado(s).');

        return self::SUCCESS;
    }
}
