<?php

namespace Tests\Feature;

use App\Models\Anexo;
use App\Models\Categoria;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicacaoUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required.');
        }

        parent::setUp();
    }

    public function test_publicacao_can_be_created_with_attachments(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $categoria = Categoria::factory()->create();

        $response = $this
            ->actingAs($user, 'sanctum')
            ->post('/api/publicacoes', [
                'titulo' => 'Publicacao com anexos',
                'categoria_id' => $categoria->id,
                'autor' => 'Autor teste',
                'resumo' => 'Resumo da publicacao',
                'conteudo' => 'Conteudo da publicacao',
                'status' => 'publicado',
                'anexos' => [
                    UploadedFile::fake()->create(
                        'contrato.pdf',
                        128,
                        'application/pdf'
                    ),
                ],
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.anexos.0.nome_arquivo', 'contrato.pdf');

        $anexo = Anexo::query()->firstOrFail();

        $this->assertNotNull($anexo->uuid);
        $this->assertDatabaseHas('anexos', [
            'publicacao_id' => $response->json('data.id'),
            'nome_arquivo' => 'contrato.pdf',
        ]);
        Storage::disk('public')->assertExists($anexo->arquivo);
    }

    public function test_publicacao_update_removes_selected_attachments_and_adds_new_files(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $categoria = Categoria::factory()->create();
        $publicacao = Publicacao::factory()
            ->for($user, 'user')
            ->for($categoria, 'categoria')
            ->create();

        $oldPath = "publicacoes/{$publicacao->id}/anexos/antigo.pdf";
        Storage::disk('public')->put($oldPath, 'anexo antigo');

        $oldAnexo = Anexo::create([
            'publicacao_id' => $publicacao->id,
            'descricao' => 'Anexo antigo',
            'arquivo' => $oldPath,
            'nome_arquivo' => 'antigo.pdf',
        ]);

        $response = $this
            ->actingAs($user, 'sanctum')
            ->post("/api/publicacoes/{$publicacao->id}", [
                '_method' => 'PUT',
                'titulo' => 'Publicacao atualizada',
                'status' => 'publicado',
                'anexos_remover' => [$oldAnexo->uuid],
                'anexos' => [
                    UploadedFile::fake()->create(
                        'novo.docx',
                        64,
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ),
                ],
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Publicacao atualizada')
            ->assertJsonPath('data.anexos.0.nome_arquivo', 'novo.docx');

        $this->assertSoftDeleted('anexos', ['id' => $oldAnexo->id]);
        Storage::disk('public')->assertMissing($oldPath);

        $this->assertDatabaseHas('anexos', [
            'publicacao_id' => $publicacao->id,
            'nome_arquivo' => 'novo.docx',
            'deleted_at' => null,
        ]);
    }
}
