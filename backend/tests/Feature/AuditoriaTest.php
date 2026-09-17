<?php

namespace Tests\Feature;

use App\Models\AuditoriaArquivo;
use App\Models\AuditoriaLog;
use App\Models\Cliente;
use App\Models\Role;
use App\Models\User;
use App\Services\ArquivarAuditoriaService;
use Carbon\CarbonImmutable;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Psr\Log\LoggerInterface;
use Tests\TestCase;

class AuditoriaTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->syncRoles([Role::findOrCreate($role, 'api')]);

        return $user;
    }

    public function test_reads_updates_deletions_and_failed_requests_record_actor_and_target_without_payloads(): void
    {
        $user = $this->user('funcionario');
        $client = Cliente::factory()->create();
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/clientes?search=segredo-na-query')->assertOk();
        $this->putJson('/api/clientes/'.$client->id, [
            'name' => 'Nome atualizado', 'cpf_cnpj' => $client->cpf_cnpj,
            'password' => 'senha-nao-registrar', 'token' => 'token-nao-registrar',
        ])->assertSuccessful();
        $this->deleteJson('/api/clientes/'.$client->id)->assertSuccessful();
        $this->getJson('/api/users')->assertForbidden();
        $this->assertSame(['consultar', 'alterar', 'excluir', 'consultar'], AuditoriaLog::orderBy('id')->pluck('acao')->all());
        $this->assertSame($user->id, AuditoriaLog::first()->usuario_id);
        $this->assertSame($client->id, AuditoriaLog::where('acao', 'alterar')->sole()->registros['cliente']);
        $this->assertSame(403, AuditoriaLog::orderByDesc('id')->first()->status_http);
        $json = AuditoriaLog::all()->toJson();
        foreach (['segredo-na-query', 'senha-nao-registrar', 'token-nao-registrar', $client->cpf_cnpj] as $secret) {
            $this->assertStringNotContainsString($secret, $json);
        }
    }

    public function test_login_failure_and_success_are_logged_without_credentials_or_tokens(): void
    {
        $user = $this->user();
        $this->postJson('/api/auth/login', ['identifier' => $user->email, 'password' => 'wrong-password'])->assertUnprocessable();
        $this->assertNull(AuditoriaLog::first()->usuario_id);
        $response = $this->postJson('/api/auth/login', ['identifier' => $user->email, 'password' => 'password'])->assertOk();
        $entry = AuditoriaLog::orderByDesc('id')->first();
        $this->assertSame('login', $entry->acao);
        $this->assertSame($user->id, $entry->usuario_id);
        $json = AuditoriaLog::all()->toJson();
        $this->assertStringNotContainsString($user->email, $json);
        $this->assertStringNotContainsString('wrong-password', $json);
        $this->assertStringNotContainsString($response->json('data.token'), $json);
        $this->withToken($response->json('data.token'))->postJson('/api/auth/logout')->assertOk();
        $this->assertSame('logout', AuditoriaLog::orderByDesc('id')->first()->acao);
        $this->assertSame($user->id, AuditoriaLog::orderByDesc('id')->first()->usuario_id);
    }

    public function test_only_admin_can_read_logs_or_download_archives_and_there_are_no_write_routes(): void
    {
        Storage::fake('auditoria');
        $file = AuditoriaArquivo::create([
            'inicio_em' => now()->subDays(30), 'fim_em' => now(), 'caminho' => 'test.jsonl',
            'quantidade' => 0, 'sha256' => hash('sha256', 'test'), 'criado_em' => now(),
        ]);
        Storage::disk('auditoria')->put('test.jsonl', 'test');
        $this->getJson('/api/auditoria')->assertUnauthorized();
        $this->actingAs($this->user('funcionario'), 'sanctum');
        $this->getJson('/api/auditoria')->assertForbidden();
        $this->getJson('/api/auditoria/arquivos')->assertForbidden();
        $this->getJson('/api/auditoria/arquivos/'.$file->id.'/download')->assertForbidden();
        $this->actingAs($this->user(), 'sanctum');
        $this->getJson('/api/auditoria')->assertOk();
        $this->getJson('/api/auditoria/arquivos')->assertOk()->assertJsonMissingPath('arquivos.data.0.caminho');
        $this->get('/api/auditoria/arquivos/'.$file->id.'/download')->assertOk()->assertDownload();
        $this->deleteJson('/api/auditoria')->assertStatus(405);
    }

    public function test_archive_closes_exact_30_day_periods_keeps_history_and_is_idempotent(): void
    {
        Storage::fake('auditoria');
        $start = CarbonImmutable::parse('2026-01-01 10:00:00');
        DB::table('auditoria_ciclos')->where('id', 1)->update(['inicio_em' => $start]);
        foreach ([$start, $start->addDays(30), $start->addDays(60)] as $date) {
            $this->logAt($date);
        }
        $this->travelTo($start->addDays(30)->subSecond());
        $this->assertSame(0, app(ArquivarAuditoriaService::class)->executar());
        $this->travelTo($start->addDays(60));
        $this->assertSame(2, app(ArquivarAuditoriaService::class)->executar());
        $this->assertDatabaseCount('auditoria_logs', 3);
        $this->assertDatabaseCount('auditoria_arquivos', 2);
        $this->assertSame(0, app(ArquivarAuditoriaService::class)->executar());
        foreach (AuditoriaArquivo::all() as $file) {
            $content = Storage::disk('auditoria')->get($file->caminho);
            $this->assertSame(hash('sha256', $content), $file->sha256);
            $this->assertSame(1, $file->quantidade);
            $lines = explode("\n", trim($content));
            $this->assertCount(2, $lines);
            $this->assertSame('auditoria-v1', json_decode($lines[0], true)['formato']);
            $this->assertSame('consultar', json_decode($lines[1], true)['acao']);
        }
        $this->assertCount(2, Storage::disk('auditoria')->allFiles());
    }

    public function test_failed_archive_does_not_advance_cycle_or_lose_logs(): void
    {
        $start = now()->subDays(30)->startOfSecond();
        DB::table('auditoria_ciclos')->where('id', 1)->update(['inicio_em' => $start]);
        $this->logAt(CarbonImmutable::instance($start));
        $disk = Mockery::mock(FilesystemAdapter::class);
        $disk->shouldReceive('put')->once()->andReturn(false);
        $disk->shouldReceive('delete')->once()->andReturn(true);
        Storage::shouldReceive('disk')->with('auditoria')->andReturn($disk);
        try {
            app(ArquivarAuditoriaService::class)->executar();
            $this->fail('A failed write must not close the period.');
        } catch (\RuntimeException) {
            $this->assertSame($start->toDateTimeString(), DB::table('auditoria_ciclos')->value('inicio_em'));
            $this->assertDatabaseCount('auditoria_logs', 1);
            $this->assertDatabaseCount('auditoria_arquivos', 0);
        }
    }

    public function test_filters_and_pagination(): void
    {
        $this->actingAs($this->user(), 'sanctum');
        for ($i = 0; $i < 30; $i++) {
            $this->logAt(CarbonImmutable::now()->subHour(), ['usuario_nome' => 'Operadora teste', 'modulo' => 'clientes', 'status_http' => 403]);
        }
        $this->logAt(CarbonImmutable::now(), ['usuario_nome' => 'Outra pessoa']);
        $url = '/api/auditoria?usuario=Operadora&modulo=clientes&resultado=falha&acao=consultar';
        $this->getJson($url)->assertOk()->assertJsonPath('total', 30)->assertJsonCount(25, 'data');
        $this->getJson($url.'&page=2')->assertOk()->assertJsonCount(5, 'data');
        $this->getJson('/api/auditoria?inicio=2026-03-03&fim=2026-02-01')->assertUnprocessable();
    }

    public function test_audit_failure_has_private_fallback_without_losing_successful_response(): void
    {
        $this->actingAs($this->user(), 'sanctum');
        AuditoriaLog::creating(fn () => throw new \RuntimeException('database failure'));
        $logger = Mockery::mock(LoggerInterface::class);
        Log::shouldReceive('build')->once()->andReturn($logger);
        $logger->shouldReceive('critical')->once()->withArgs(fn ($message, $data) => $data['acao'] === 'consultar' && ! str_contains(json_encode($data), 'private-search'));
        $this->getJson('/api/clientes?search=private-search')->assertOk();
    }

    private function logAt(CarbonImmutable $date, array $extra = []): AuditoriaLog
    {
        return AuditoriaLog::create(array_merge([
            'usuario_nome' => 'Operador', 'perfis' => ['funcionario'], 'acao' => 'consultar',
            'modulo' => 'clientes', 'metodo' => 'GET', 'rota' => 'api/clientes',
            'registros' => [], 'status_http' => 200, 'ocorrido_em' => $date,
        ], $extra));
    }
}
