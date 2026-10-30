<?php

namespace Tests\Feature;

use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Services\DjenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Live smoke test for the official public DJEN API. It is opt-in so the normal
 * test suite remains deterministic and does not depend on CNJ availability.
 *
 * Public process: 0000037-28.2012.5.01.0010 (TRT1).
 * Public communication: DJEN id 611368150, disponibilized on 2026-05-15.
 * Official API query: https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroProcesso=0000037-28.2012.5.01.0010&dataDisponibilizacaoInicio=2026-05-15&dataDisponibilizacaoFim=2026-05-15
 * Run with: DJEN_LIVE_TEST=1 php artisan test --filter=DjenLivePublicProcessTest
 */
class DjenLivePublicProcessTest extends TestCase
{
    use RefreshDatabase;

    private const PROCESS_NUMBER = '0000037-28.2012.5.01.0010';

    private const PUBLIC_COMMUNICATION_ID = '611368150';

    public function test_public_djen_communication_is_imported_and_associated_with_the_case(): void
    {
        if (env('DJEN_LIVE_TEST') !== '1') {
            $this->markTestSkipped('Defina DJEN_LIVE_TEST=1 para consultar a API pública de produção do CNJ.');
        }

        config([
            'services.djen.base_url' => 'https://comunicaapi.pje.jus.br/api/v1',
            'services.djen.timeout' => 30,
            'services.djen.per_page' => 100,
            'services.djen.max_pages' => 5,
            'services.djen.page_delay_us' => 0,
            'services.djen.retry_attempts' => 2,
            'services.djen.retry_delay_ms' => 1000,
        ]);

        $case = Caso::factory()->create([
            'titulo' => 'Caso público de integração DJEN',
            'numero_processo' => self::PROCESS_NUMBER,
        ]);

        app(DjenService::class)->sincronizarCaso($case, Carbon::parse('2026-05-15'));

        $communication = ComunicacaoDjen::query()
            ->where('djen_id', self::PUBLIC_COMMUNICATION_ID)
            ->first();

        $this->assertNotNull($communication, 'A API do DJEN não retornou a comunicação pública esperada.');
        $this->assertSame($case->id, $communication->caso_id);
        $this->assertSame('00000372820125010010', $communication->numero_processo);
        $this->assertSame('TRT1', $communication->sigla_tribunal);
        $this->assertSame('2026-05-15', $communication->data_disponibilizacao->toDateString());
        $this->assertNotEmpty($communication->texto);
        $this->assertSame('https', parse_url($communication->link, PHP_URL_SCHEME));
    }
}
