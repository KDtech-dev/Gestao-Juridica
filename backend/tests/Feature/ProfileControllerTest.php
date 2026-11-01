<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use App\Models\Role;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required.');
        }

        parent::setUp();
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Nome antigo',
            'cpf' => '12345678901',
        ]);

        $response = $this
            ->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'Nome atualizado',
                'email' => $user->email,
                'cpf' => '987.654.321-00',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Nome atualizado')
            ->assertJsonPath('data.user.cpf', '98765432100');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome atualizado',
            'cpf' => '98765432100',
        ]);
    }

    public function test_authenticated_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('senha-antiga'),
        ]);
        $user->createToken('dispositivo-antigo');

        $response = $this
            ->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => 'senha-antiga',
                'new_password' => 'senha-nova',
                'new_password_confirmation' => 'senha-nova',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Senha atualizada com sucesso.');

        $this->assertTrue(
            Hash::check('senha-nova', $user->fresh()->password)
        );
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_password_reset_revokes_existing_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('dispositivo-antigo');
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'senha-nova123',
            'password_confirmation' => 'senha-nova123',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('senha-nova123', $user->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_password_reset_revokes_existing_tokens(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('senha-admin'),
        ]);
        $admin->syncRoles([Role::findOrCreate('admin', 'api')]);

        $target = User::factory()->create();
        $target->createToken('dispositivo-antigo');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/users/{$target->id}/reset-password", [
                'admin_password' => 'senha-admin',
                'new_password' => 'senha-nova123',
                'new_password_confirmation' => 'senha-nova123',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('senha-nova123', $target->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
