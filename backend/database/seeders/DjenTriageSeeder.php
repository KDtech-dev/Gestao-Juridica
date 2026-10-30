<?php

namespace Database\Seeders;

use App\Models\ComunicacaoDjen;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DjenTriageSeeder extends Seeder
{
    /**
     * Seed fictional DJEN entries so the triage inbox has safe demo data.
     * The stable DJEN ids make this seeder idempotent and preserve any later
     * manual linking or read status when the seeder is run again.
     */
    public function run(): void
    {
        $samples = [
            [
                'djen_id' => 'demo-trt1-intimacao-001',
                'sigla_tribunal' => 'TRT1',
                'nome_orgao' => 'Vara do Trabalho — dado demonstrativo',
                'tipo_comunicacao' => 'Intimação (demonstração)',
                'data_disponibilizacao' => Carbon::today()->subDay()->toDateString(),
                'texto' => 'DADO DE DEMONSTRAÇÃO — esta comunicação é fictícia e não corresponde a publicação oficial. Use este item para testar a triagem e o vínculo a um caso.',
                'status_djen' => 'P',
                'lida_em' => null,
            ],
            [
                'djen_id' => 'demo-tjmg-despacho-002',
                'sigla_tribunal' => 'TJMG',
                'nome_orgao' => 'Vara Cível — dado demonstrativo',
                'tipo_comunicacao' => 'Despacho (demonstração)',
                'data_disponibilizacao' => Carbon::today()->subDays(3)->toDateString(),
                'texto' => 'DADO DE DEMONSTRAÇÃO — texto fictício para visualizar o conteúdo expandido e testar filtros por tribunal e data.',
                'status_djen' => 'P',
                'lida_em' => null,
            ],
            [
                'djen_id' => 'demo-trf1-comunicacao-lida-003',
                'sigla_tribunal' => 'TRF1',
                'nome_orgao' => 'Secretaria de Vara Federal — dado demonstrativo',
                'tipo_comunicacao' => 'Comunicação (demonstração)',
                'data_disponibilizacao' => Carbon::today()->subDays(7)->toDateString(),
                'texto' => 'DADO DE DEMONSTRAÇÃO — exemplo fictício já marcado como lido para testar a visualização de itens lidos.',
                'status_djen' => 'P',
                'lida_em' => Carbon::today()->subDays(6),
            ],
        ];

        foreach ($samples as $sample) {
            ComunicacaoDjen::query()->firstOrCreate(
                ['djen_id' => $sample['djen_id']],
                array_merge($sample, [
                    'caso_id' => null,
                    'numero_processo' => null,
                    'link' => null,
                    'motivo_cancelamento' => null,
                    'data_cancelamento' => null,
                    'payload' => ['demo' => true, 'source' => 'DjenTriageSeeder'],
                ]),
            );
        }
    }
}
