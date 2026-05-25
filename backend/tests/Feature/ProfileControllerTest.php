<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

        $response = $this
            ->actingAs($user, 'sanctum')
            ->putJson('/api/profile/password', [
                'current_password' => 'senha-antiga',
                'new_password' => 'senha-nova',
                'confirm_password' => 'senha-nova',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Senha atualizada com sucesso.');

        $this->assertTrue(
            Hash::check('senha-nova', $user->fresh()->password)
        );
    }
}
