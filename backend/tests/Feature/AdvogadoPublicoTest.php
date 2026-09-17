<?php

namespace Tests\Feature;

use App\Models\Advogado;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvogadoPublicoTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_listing_exposes_only_the_existing_public_fields(): void
    {
        $user = User::factory()->create(['cpf' => '12345678901']);
        Advogado::create([
            'user_id' => $user->id,
            'oab_numero' => '12345',
            'oab_uf' => 'MG',
            'celular' => '33999999999',
            'resumo_pessoal' => 'Apresentação pública.',
        ]);

        $response = $this->getJson('/api/advogados')->assertOk();
        $lawyer = $response->json('data.0');

        $this->assertEqualsCanonicalizing([
            'uuid', 'name', 'foto_perfil_url', 'oab_numero',
            'oab_uf', 'resumo_pessoal', 'categorias',
        ], array_keys($lawyer));
        $this->assertSame($user->id, $lawyer['uuid']);
        $this->assertSame('Apresentação pública.', $lawyer['resumo_pessoal']);
        $this->assertNull($lawyer['foto_perfil_url']);
        $this->assertSame([], $lawyer['categorias']);
        $response->assertDontSee($user->cpf)->assertDontSee($user->email)->assertDontSee('33999999999');
    }
}
