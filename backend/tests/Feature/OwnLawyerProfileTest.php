<?php

namespace Tests\Feature;

use App\Models\Advogado;
use App\Models\Categoria;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OwnLawyerProfileTest extends TestCase
{
    use RefreshDatabase;

    private function lawyer(string $oab): User
    {
        $user = User::factory()->create();
        $user->syncRoles([Role::findOrCreate('advogado', 'api')]);
        Advogado::create(['user_id' => $user->id, 'oab_numero' => $oab, 'oab_uf' => 'MG', 'resumo_pessoal' => 'Texto anterior']);

        return $user;
    }

    public function test_lawyer_can_read_and_publish_only_their_own_profile(): void
    {
        $user = $this->lawyer('12345');
        $other = $this->lawyer('67890');
        $category = Categoria::create(['nome' => 'Direito Civil']);
        $this->actingAs($user, 'sanctum')->getJson('/api/profile')
            ->assertOk()->assertJsonPath('data.user.advogado.oab_numero', '12345');

        $this->putJson('/api/profile', [
            'name' => 'Nome atualizado',
            'advogado' => ['resumo_pessoal' => 'Apresentação atualizada', 'oab_numero' => '54321', 'oab_uf' => 'SP', 'categorias' => [$category->id]],
        ])->assertOk()->assertJsonPath('data.user.advogado.resumo_pessoal', 'Apresentação atualizada');

        $this->getJson('/api/advogados')->assertOk()->assertJsonFragment([
            'name' => 'Nome atualizado', 'resumo_pessoal' => 'Apresentação atualizada', 'oab_numero' => '54321', 'oab_uf' => 'SP', 'categorias' => ['Direito Civil'],
        ]);
        $this->assertSame('Texto anterior', $other->advogado->resumo_pessoal);
        $denied = $this->putJson('/api/users/'.$other->id, ['name' => 'Alteração indevida']);
        $this->assertSame(403, $denied->status(), $denied->getContent());

        $this->putJson('/api/profile', ['advogado' => ['resumo_pessoal' => null, 'categorias' => []]])
            ->assertOk()->assertJsonPath('data.user.advogado.resumo_pessoal', null)->assertJsonPath('data.user.advogado.categorias', []);
    }

    public function test_self_edit_cannot_change_identity_roles_or_nested_owner(): void
    {
        $user = $this->lawyer('12345');
        $other = $this->lawyer('67890');
        $this->actingAs($user, 'sanctum')->putJson('/api/profile', [
            'id' => $other->id, 'role' => 'admin', 'advogado' => ['user_id' => $other->id],
        ])->assertUnprocessable()->assertJsonValidationErrors(['id', 'role', 'advogado']);
        $this->assertTrue($user->fresh()->hasRole('advogado'));
        $this->assertSame($user->id, $user->advogado->user_id);
    }

    public function test_lawyer_can_upload_own_photo_without_admin_access(): void
    {
        Storage::fake('public');
        $user = $this->lawyer('12345');
        $other = $this->lawyer('67890');
        $this->actingAs($user, 'sanctum')->post('/api/profile/foto', [
            'foto_perfil' => UploadedFile::fake()->image('perfil.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();
        $user->refresh();
        Storage::disk('public')->assertExists($user->foto_perfil);
        $this->assertNull($other->fresh()->foto_perfil);
    }

    public function test_anonymous_requests_cannot_read_or_edit_internal_profile(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
        $this->putJson('/api/profile', ['name' => 'Alteração'])->assertUnauthorized();
        $this->postJson('/api/profile/foto')->assertUnauthorized();
    }
}
