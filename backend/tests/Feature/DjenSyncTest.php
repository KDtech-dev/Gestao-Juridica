<?php

namespace Tests\Feature;

use App\Exceptions\DjenIndisponivelException;
use App\Exceptions\DjenPageLimitReachedException;
use App\Jobs\SyncDjenRunJob;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Models\DjenSyncRun;
use App\Models\Permission;
use App\Models\User;
use App\Services\Djen\DjenClient;
use App\Services\DjenService;
use App\Services\DjenSyncCoordinator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class DjenSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_returns_json_from_the_djen_api(): void
    {
        Http::fake([
            '*' => Http::response(['items' => [['id' => 'djen-1']]], 200),
        ]);

        $result = app(DjenClient::class)->consultar(['pagina' => 1]);

        $this->assertSame('djen-1', $result['items'][0]['id']);
        Http::assertSent(fn ($request) => parse_url($request->url(), PHP_URL_PATH) === '/api/v1/comunicacao'
            && $request['pagina'] === 1
            && $request->hasHeader('Accept'));
    }

    public function test_client_turns_geographic_block_into_a_domain_error(): void
    {
        Http::fake(['*' => Http::response([], 403)]);

        $this->expectException(DjenIndisponivelException::class);
        app(DjenClient::class)->consultar(['pagina' => 1]);
    }

    public function test_client_retries_temporary_server_errors(): void
    {
        config(['services.djen.retry_attempts' => 2, 'services.djen.retry_delay_ms' => 0]);
        Http::fakeSequence()
            ->push([], 503)
            ->push(['items' => []], 200);

        $result = app(DjenClient::class)->consultar(['pagina' => 1]);

        $this->assertSame([], $result['items']);
        Http::assertSentCount(2);
    }

    public function test_case_sync_paginates_and_reports_page_progress(): void
    {
        config(['services.djen.per_page' => 2, 'services.djen.page_delay_us' => 0]);
        $caso = Caso::factory()->create([
            'numero_processo' => '0000000-00.0000.8.13.0000',
        ]);
        Http::fakeSequence()
            ->push(['items' => [$this->item('page-1-a', 'A'), $this->item('page-1-b', 'B')]], 200)
            ->push(['items' => [$this->item('page-2-a', 'C')]], 200);
        $lastProgress = [];

        $processed = app(DjenService::class)->sincronizarCaso(
            $caso,
            Carbon::parse('2026-10-25'),
            function (array $progress) use (&$lastProgress): void {
                $lastProgress = $progress;
            },
        );

        $this->assertSame(3, $processed);
        $this->assertSame(2, $lastProgress['pages_completed']);
        $this->assertSame(3, $lastProgress['items_created']);
        Http::assertSentCount(2);
    }

    public function test_lawyer_sync_queries_all_oab_variants_and_keeps_cumulative_progress(): void
    {
        config(['services.djen.per_page' => 50, 'services.djen.page_delay_us' => 0]);
        $advogado = Advogado::create([
            'user_id' => User::factory()->create()->id,
            'oab_numero' => '12.345',
            'oab_uf' => 'MG',
        ]);
        Http::fake(function ($request) {
            $oab = $request['numeroOab'];

            return Http::response(['items' => [$this->item('oab-'.$oab, 'Comunicado '.$oab)]], 200);
        });
        $lastProgress = [];

        $processed = app(DjenService::class)->sincronizarAdvogado(
            $advogado,
            Carbon::parse('2026-10-25'),
            function (array $progress) use (&$lastProgress): void {
                $lastProgress = $progress;
            },
        );

        $this->assertSame(4, $processed);
        $this->assertSame(4, $lastProgress['pages_completed']);
        $this->assertSame(4, $lastProgress['items_created']);
        $this->assertSame(4, ComunicacaoDjen::query()->count());
        Http::assertSentCount(4);
    }

    public function test_page_limit_marks_run_failed_without_advancing_checkpoint(): void
    {
        config([
            'services.djen.per_page' => 1,
            'services.djen.max_pages' => 1,
            'services.djen.page_delay_us' => 0,
        ]);
        $caso = Caso::factory()->create([
            'numero_processo' => '0000000-00.0000.8.13.0000',
        ]);
        $run = $this->queuedRun($caso);
        Http::fake(['*' => Http::response(['items' => [$this->item('last-page', 'Dado')]], 200)]);

        (new SyncDjenRunJob($run->id))->handle(app(DjenService::class));

        $run->refresh();
        $this->assertSame(DjenSyncRun::STATUS_FAILED, $run->status);
        $this->assertNull($run->checkpoint_at);
        $this->assertStringContainsString('DJEN_MAX_PAGES', $run->last_error);
    }

    public function test_sync_job_upserts_notifications_and_reports_created_or_updated_counts(): void
    {
        config(['services.djen.per_page' => 50, 'services.djen.page_delay_us' => 0]);
        Carbon::setTestNow('2026-10-28 12:00:00');
        $caso = Caso::factory()->create([
            'numero_processo' => '0000000-00.0000.8.13.0000',
        ]);
        $run = $this->queuedRun($caso);

        Http::fakeSequence()
            ->push(['items' => [$this->item('djen-unique', 'Texto inicial')]], 200)
            ->push(['items' => [$this->item('djen-unique', 'Texto atualizado')]], 200);
        (new SyncDjenRunJob($run->id))->handle(app(DjenService::class));

        $run->refresh();
        $this->assertSame(DjenSyncRun::STATUS_COMPLETED, $run->status);
        $this->assertSame(1, $run->items_processed);
        $this->assertSame(1, $run->items_created);
        $this->assertSame(0, $run->items_updated);
        $this->assertNotNull($run->checkpoint_at);

        $nextRun = $this->queuedRun($caso);
        (new SyncDjenRunJob($nextRun->id))->handle(app(DjenService::class));

        $nextRun->refresh();
        $this->assertSame(0, $nextRun->items_created);
        $this->assertSame(1, $nextRun->items_updated);
        $this->assertSame(1, ComunicacaoDjen::query()->count());
        $this->assertSame('Texto atualizado', ComunicacaoDjen::query()->firstOrFail()->texto);

        Carbon::setTestNow();
    }

    public function test_coordinator_uses_the_last_successful_checkpoint_and_deduplicates_active_runs(): void
    {
        Queue::fake();
        Carbon::setTestNow('2026-10-28 12:00:00');
        $actor = User::factory()->create();
        $caso = Caso::factory()->create([
            'numero_processo' => '0000000-00.0000.8.13.0000',
        ]);
        $this->queuedRun($caso)->forceFill([
            'status' => DjenSyncRun::STATUS_COMPLETED,
            'checkpoint_at' => Carbon::parse('2026-10-20 08:00:00'),
            'completed_at' => Carbon::parse('2026-10-20 08:00:00'),
        ])->save();

        $coordinator = app(DjenSyncCoordinator::class);
        [$run, $created] = $coordinator->enqueue($caso, $actor);
        [$sameRun, $createdAgain] = $coordinator->enqueue($caso, $actor);

        $this->assertTrue($created);
        $this->assertFalse($createdAgain);
        $this->assertSame($run->id, $sameRun->id);
        $this->assertSame('2026-10-17', $run->from_date->toDateString());
        Queue::assertPushed(SyncDjenRunJob::class, 1);

        Carbon::setTestNow();
    }

    public function test_sync_endpoint_queues_work_and_exposes_run_status(): void
    {
        Queue::fake();
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('djen.sincronizar', 'api'));
        $caso = Caso::factory()->create([
            'numero_processo' => '0000000-00.0000.8.13.0000',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/casos/{$caso->id}/sincronizar-djen")
            ->assertStatus(202)
            ->assertJsonPath('data.status', DjenSyncRun::STATUS_QUEUED);

        $runId = $response->json('data.id');
        Queue::assertPushedOn('djen', SyncDjenRunJob::class);

        $this->getJson("/api/djen-sync-runs/{$runId}")
            ->assertOk()
            ->assertJsonPath('data.id', $runId)
            ->assertJsonPath('data.items_processed', 0);

        $this->postJson("/api/casos/{$caso->id}/sincronizar-djen")
            ->assertOk()
            ->assertJsonPath('data.id', $runId);
        Queue::assertPushed(SyncDjenRunJob::class, 1);
    }

    private function queuedRun(Caso $caso): DjenSyncRun
    {
        return DjenSyncRun::query()->create([
            'target_type' => 'caso',
            'target_id' => $caso->id,
            'status' => DjenSyncRun::STATUS_QUEUED,
            'from_date' => now()->subDays(3)->toDateString(),
        ]);
    }

    private function item(string $id, string $text): array
    {
        return [
            'id' => $id,
            'numero_processo' => '0000000-00.0000.8.13.0000',
            'siglaTribunal' => 'TJMG',
            'nomeOrgao' => 'Vara de teste',
            'tipoComunicacao' => 'Intimação',
            'data_disponibilizacao' => '28/10/2026',
            'texto' => $text,
            'link' => 'https://example.test/djen/'.$id,
        ];
    }
}
