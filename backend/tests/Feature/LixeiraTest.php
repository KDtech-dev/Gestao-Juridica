<?php

namespace Tests\Feature;

use App\Models\Caso;
use App\Models\Cliente;
use App\Models\Compromisso;
use App\Models\Exclusao;
use App\Models\Notificacao;
use App\Models\Publicacao;
use App\Models\Role;
use App\Models\User;
use App\Services\LixeiraService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LixeiraTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['public', 'local', 'lixeira'] as $disk) {
            Storage::fake($disk);
        }
        $this->admin = User::factory()->create();
        $this->admin->syncRoles([Role::findOrCreate('admin', 'api')]);
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_client_and_photo_can_be_restored_with_relationships_and_audit(): void
    {
        $client = Cliente::factory()->create(['foto_perfil' => 'clientes/foto.jpg']);
        $case = Caso::factory()->create();
        $case->clientes()->attach($client, ['papel' => 'reu']);
        Storage::disk('public')->put($client->foto_perfil, 'foto original');
        $this->deleteJson('/api/clientes/'.$client->id)->assertSuccessful();
        $this->assertSoftDeleted($client);
        Storage::disk('public')->assertMissing($client->foto_perfil);
        $entry = Exclusao::sole();
        $this->assertSame($this->admin->id, $entry->excluido_por);
        $this->assertEqualsWithDelta(30, now()->diffInDays($entry->expira_em), 0.01);
        $this->getJson('/api/lixeira')->assertOk()->assertJsonMissingPath('data.0.conteudo');
        $this->assertStringNotContainsString('clientes/foto.jpg', DB::table('exclusoes')->value('conteudo'));
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertOk();
        $this->assertNotSoftDeleted($client);
        $this->assertSame('foto original', Storage::disk('public')->get($client->foto_perfil));
        $this->assertSame('reu', $case->clientes()->first()->pivot->papel);
        $this->assertSame($this->admin->id, $entry->fresh()->restaurado_por);
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertGone();
    }

    public function test_case_deletion_hides_private_attachments_and_restores_them_together(): void
    {
        $case = Caso::factory()->create();
        $attachment = $case->anexos()->create(['arquivo' => 'casos/documento.pdf']);
        Storage::disk('local')->put($attachment->arquivo, 'documento privado');
        $this->deleteJson('/api/casos/'.$case->id)->assertOk();
        $this->getJson('/api/anexos/'.$attachment->uuid.'/download')->assertNotFound();
        Storage::disk('local')->assertMissing($attachment->arquivo);
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->getJson('/api/anexos/'.$attachment->uuid.'/download')->assertOk();
    }

    public function test_publication_deletion_hides_banner_and_attachments_from_public_routes(): void
    {
        $post = Publicacao::factory()->publicado()->create(['imagem_caminho' => 'publicacoes/banner.jpg']);
        $attachment = $post->anexos()->create(['arquivo' => 'publicacoes/a.pdf']);
        Storage::disk('public')->put($post->imagem_caminho, 'banner');
        Storage::disk('public')->put($attachment->arquivo, 'anexo');
        $this->deleteJson('/api/publicacoes/'.$post->id)->assertOk();
        $this->getJson('/api/posts/'.$post->id)->assertNotFound();
        $this->getJson('/api/posts/'.$post->id.'/anexos/'.$attachment->uuid)->assertNotFound();
        Storage::disk('public')->assertMissing([$post->imagem_caminho, $attachment->arquivo]);
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->getJson('/api/posts/'.$post->id.'/anexos/'.$attachment->uuid)->assertOk();
    }

    public function test_non_admin_cannot_list_restore_or_download(): void
    {
        app(LixeiraService::class)->excluir(Cliente::factory()->create());
        $entry = Exclusao::sole();
        $this->app['auth']->forgetGuards();
        $user = User::factory()->create();
        $user->syncRoles([Role::findOrCreate('funcionario', 'api')]);
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/lixeira')->assertForbidden();
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertForbidden();
        $this->getJson('/api/lixeira/'.$entry->id.'/arquivo')->assertForbidden();
    }

    public function test_expiration_purges_content_but_preserves_audit_and_restored_records(): void
    {
        $client = Cliente::factory()->create(['foto_perfil' => 'clientes/foto.jpg']);
        Storage::disk('public')->put($client->foto_perfil, 'foto');
        $entry = app(LixeiraService::class)->excluir($client);
        $restored = Cliente::factory()->create();
        $other = app(LixeiraService::class)->excluir($restored);
        app(LixeiraService::class)->restaurar($other);
        $this->travel(30)->days();
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertGone();
        $this->artisan('lixeira:limpar')->assertSuccessful();
        $this->assertDatabaseMissing('clientes', ['id' => $client->id]);
        $this->assertNotSoftDeleted($restored);
        $this->assertNull($entry->fresh()->conteudo);
        $this->assertNotNull($entry->fresh()->eliminado_em);
        $this->assertSame([], Storage::disk('lixeira')->allFiles());
        $this->artisan('lixeira:limpar')->assertSuccessful();
    }

    public function test_failed_backup_cancels_deletion(): void
    {
        $client = Cliente::factory()->create(['foto_perfil' => 'missing.jpg']);
        try {
            app(LixeiraService::class)->excluir($client);
            $this->fail('Missing file must cancel deletion.');
        } catch (\RuntimeException $e) {
            $this->assertNotSoftDeleted($client);
            $this->assertDatabaseCount('exclusoes', 0);
        }
    }

    public function test_restore_does_not_overwrite_a_new_file(): void
    {
        $client = Cliente::factory()->create(['foto_perfil' => 'clientes/foto.jpg']);
        Storage::disk('public')->put($client->foto_perfil, 'original');
        $entry = app(LixeiraService::class)->excluir($client);
        Storage::disk('public')->put($client->foto_perfil, 'new file');
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertConflict();
        $this->assertSoftDeleted($client);
        $this->assertSame('new file', Storage::disk('public')->get($client->foto_perfil));
        $this->assertNull($entry->fresh()->restaurado_em);
    }

    public function test_user_deletion_revokes_tokens_and_restores_owned_content(): void
    {
        $user = User::factory()->create();
        $user->syncRoles([Role::findOrCreate('advogado', 'api')]);
        $user->createToken('test');
        $post = Publicacao::factory()->create(['user_id' => $user->id, 'imagem_caminho' => null]);
        $appointment = Compromisso::factory()->paraUsuario($user)->create();
        $this->deleteJson('/api/users/'.$user->id)->assertSuccessful();
        $this->assertSoftDeleted($user);
        $this->assertSoftDeleted($post);
        $this->assertSoftDeleted($appointment);
        $this->assertSame(0, $user->tokens()->count());
        $this->assertNull(User::withTrashed()->findOrFail($user->id)->remember_token);
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->assertNotSoftDeleted($user);
        $this->assertNotSoftDeleted($post);
        $this->assertTrue($user->fresh()->hasRole('advogado'));
        $this->assertSame(0, $user->tokens()->count());
        $this->assertNull(User::withTrashed()->findOrFail($user->id)->remember_token);
    }

    public function test_independently_deleted_attachment_requires_parent_restoration(): void
    {
        $case = Caso::factory()->create();
        $attachment = $case->anexos()->create(['arquivo' => 'casos/a.pdf']);
        Storage::disk('local')->put($attachment->arquivo, 'doc');
        $this->deleteJson('/api/casos/'.$case->id.'/anexos/'.$attachment->uuid)->assertOk();
        $entry = Exclusao::sole();
        $parent = app(LixeiraService::class)->excluir($case);
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertConflict();
        $this->postJson('/api/lixeira/'.$parent->id.'/restaurar')->assertOk();
        $this->assertSoftDeleted($attachment);
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertOk();
    }

    public function test_removed_photo_is_downloadable_until_expiration(): void
    {
        $user = User::factory()->create(['foto_perfil' => 'usuarios/foto.jpg']);
        Storage::disk('public')->put($user->foto_perfil, 'old photo');
        $this->deleteJson('/api/users/'.$user->id.'/foto')->assertSuccessful();
        $entry = Exclusao::sole();
        $this->assertNull($user->fresh()->foto_perfil);
        $this->get('/api/lixeira/'.$entry->id.'/arquivo')->assertOk()->assertDownload('foto.jpg');
        $this->travel(30)->days();
        $this->getJson('/api/lixeira/'.$entry->id.'/arquivo')->assertGone();
    }

    public function test_shared_banner_remains_available_for_other_posts(): void
    {
        $first = Publicacao::factory()->create(['imagem_caminho' => 'shared.jpg']);
        Publicacao::factory()->create(['imagem_caminho' => 'shared.jpg']);
        Storage::disk('public')->put('shared.jpg', 'shared banner');
        $entry = app(LixeiraService::class)->excluir($first);
        Storage::disk('public')->assertExists('shared.jpg');
        $this->postJson('/api/lixeira/'.$entry->id.'/restaurar')->assertOk();
    }

    public function test_manual_notification_cleanup_is_recoverable(): void
    {
        $notification = Notificacao::create([
            'usuario_id' => $this->admin->id, 'tipo' => 'AVISO',
            'titulo' => 'Teste', 'mensagem' => 'Mensagem preservada',
        ]);
        $this->deleteJson('/api/notificacoes', ['ids' => [$notification->id]])->assertOk();
        $this->assertSoftDeleted($notification);
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->assertNotSoftDeleted($notification);
    }

    public function test_detached_client_can_be_reattached_with_original_role(): void
    {
        $client = Cliente::factory()->create();
        $case = Caso::factory()->create();
        $case->clientes()->attach($client, ['papel' => 'reu']);
        $this->deleteJson('/api/casos/'.$case->id.'/clientes/'.$client->id)->assertOk();
        $this->assertSame(0, $case->clientes()->count());
        $this->postJson('/api/lixeira/'.Exclusao::sole()->id.'/restaurar')->assertOk();
        $this->assertSame('reu', $case->clientes()->first()->pivot->papel);
    }

    public function test_expired_user_and_dependent_content_are_removed(): void
    {
        $user = User::factory()->create();
        $post = Publicacao::factory()->create(['user_id' => $user->id, 'imagem_caminho' => null]);
        $attachment = $post->anexos()->create(['arquivo' => 'publicacoes/a.pdf']);
        Storage::disk('public')->put($attachment->arquivo, 'document');
        $appointment = Compromisso::factory()->paraUsuario($user)->create();
        app(LixeiraService::class)->excluir($user);
        $this->travel(30)->days();
        $this->artisan('lixeira:limpar')->assertSuccessful();
        foreach ([$user, $post, $attachment, $appointment] as $model) {
            $this->assertDatabaseMissing($model->getTable(), ['id' => $model->id]);
        }
        $this->assertSame([], Storage::disk('lixeira')->allFiles());
        $this->assertNotNull(Exclusao::sole()->eliminado_em);
    }

    public function test_anonymous_access_is_rejected(): void
    {
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/lixeira')->assertUnauthorized();
    }
}
