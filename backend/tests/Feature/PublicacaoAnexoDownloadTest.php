<?php

namespace Tests\Feature;

use App\Enums\StatusPublicacao;
use App\Models\Anexo;
use App\Models\Categoria;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicacaoAnexoDownloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required.');
        }

        parent::setUp();
    }

    public function test_public_attachment_can_be_downloaded_without_api_prefix(): void
    {
        Storage::fake('public');

        $path = 'publicacoes/post/anexos/documento.pdf';
        Storage::disk('public')->put($path, 'conteudo do anexo');

        $publicacao = Publicacao::create([
            'titulo' => 'Publicacao teste',
            'user_id' => User::factory()->create()->id,
            'categoria_id' => Categoria::factory()->create()->id,
            'autor' => 'Autor teste',
            'resumo' => 'Resumo',
            'conteudo' => 'Conteudo',
            'status' => StatusPublicacao::PUBLICADO,
            'publicado_em' => now(),
        ]);

        $anexo = Anexo::create([
            'publicacao_id' => $publicacao->id,
            'descricao' => 'Anexo da publicacao',
            'arquivo' => $path,
            'nome_arquivo' => 'documento.pdf',
        ]);

        $this->assertSame(
            "/posts/anexos/{$anexo->uuid}",
            $anexo->url
        );

        $this->get($anexo->url)
            ->assertOk()
            ->assertHeader('content-disposition');
    }
}
