<?php

namespace App\Console\Commands;

use App\Services\ArquivarAuditoriaService;
use Illuminate\Console\Command;

class ArquivarAuditoria extends Command
{
    protected $signature = 'auditoria:arquivar';

    protected $description = 'Salva períodos completos de 30 dias em arquivos privados sem apagar o histórico';

    public function handle(ArquivarAuditoriaService $service): int
    {
        $this->info($service->executar().' arquivo(s) de auditoria gerado(s).');

        return self::SUCCESS;
    }
}
