<?php

namespace Tests\Feature;

use App\Models\Anexo;
use App\Models\Caso;
use App\Models\Exclusao;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CasoAnexoTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['local', 'public', 'lixeira'] as $disk) {
            Storage::fake($disk);
        }
        $this->admin = User::factory()->create();
        $this->admin->syncRoles([Role::findOrCreate('admin', 'api')]);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_case_creation_stores_private_attachments_accessible_through_both_routes(): void
    {
        $response = $this->post('/api/casos', [
            'titulo' => 'Caso com anexo',
            'data_abertura' => '2026-09-17',
            'advogado_id' => $this->admin->id,
            'anexos' => [UploadedFile::fake()->createWithContent('contrato.pdf', '%PDF-1.4 contrato')],
        ])->assertCreated()->assertJsonPath('anexos.0.nome', 'contrato.pdf');

        $anexo = Anexo::sole();
        Storage::disk('local')->assertExists($anexo->arquivo);
        Storage::disk('public')->assertMissing($anexo->arquivo);
        $url = '/api/casos/'.$response->json('id').'/anexos/'.$anexo->uuid;
        $this->get($url)->assertOk()->assertStreamedContent('%PDF-1.4 contrato');
        $this->get($url.'/download')->assertOk()->assertDownload('contrato.pdf');
        $this->get('/api/anexos/'.$anexo->uuid.'/download')->assertOk();
    }

    public function test_update_removes_by_uuid_into_trash_and_restores_file(): void
    {
        $caso = Caso::factory()->create(['advogado_id' => $this->admin->id]);
        $anexo = $caso->anexos()->create([
            'arquivo' => 'casos/antigo.pdf',
            'nome_arquivo' => 'antigo.pdf',
        ]);
        Storage::disk('local')->put($anexo->arquivo, 'conteudo original');

        $this->post('/api/casos/'.$caso->id, [
            '_method' => 'PUT',
            'anexos_remover' => [$anexo->uuid],
            'anexos' => [UploadedFile::fake()->create('novo.pdf', 10, 'application/pdf')],
        ])->assertOk()->assertJsonPath('anexos.0.nome', 'novo.pdf')->assertJsonCount(1, 'anexos');

        $this->assertSoftDeleted($anexo);
        Storage::disk('local')->assertMissing($anexo->arquivo);
        $url = '/api/casos/'.$caso->id.'/anexos/'.$anexo->uuid;
        $this->getJson($url)->assertNotFound();
        $this->getJson($url.'/download')->assertNotFound();
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->get($url.'/download')->assertOk()->assertStreamedContent('conteudo original');
    }

    public function test_attachments_cannot_be_accessed_or_removed_through_another_case(): void
    {
        $caso = Caso::factory()->create(['advogado_id' => $this->admin->id]);
        $outro = Caso::factory()->create(['advogado_id' => $this->admin->id]);
        $anexo = $outro->anexos()->create(['arquivo' => 'casos/outro.pdf']);
        Storage::disk('local')->put($anexo->arquivo, 'outro caso');
        $url = '/api/casos/'.$caso->id.'/anexos/'.$anexo->uuid;
        $this->getJson($url)->assertNotFound();
        $this->getJson($url.'/download')->assertNotFound();
        $this->deleteJson($url)->assertNotFound();
        $this->putJson('/api/casos/'.$caso->id, [
            'anexos_remover' => [$anexo->uuid],
        ])->assertOk();
        $this->assertNotSoftDeleted($anexo);
        Storage::disk('local')->assertExists($anexo->arquivo);
        $this->assertDatabaseCount('exclusoes', 0);
    }

    public function test_existing_upload_and_list_endpoints_are_preserved(): void
    {
        $caso = Caso::factory()->create(['advogado_id' => $this->admin->id]);
        $url = '/api/casos/'.$caso->id.'/anexos';
        $this->post($url, [
            'arquivo' => UploadedFile::fake()->create('avulso.pdf', 10, 'application/pdf'),
        ])->assertCreated()->assertJsonPath('data.nome_arquivo', 'avulso.pdf');
        $anexo = Anexo::sole();
        Storage::disk('local')->assertExists($anexo->arquivo);
        $this->getJson($url)->assertOk()->assertJsonPath('data.0.id', $anexo->uuid);
        $this->deleteJson($url.'/'.$anexo->uuid)->assertOk();
        $this->assertSoftDeleted($anexo);
        $this->assertDatabaseCount('exclusoes', 1);
    }
}
