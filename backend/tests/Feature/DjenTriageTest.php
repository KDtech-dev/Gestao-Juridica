<?php

namespace Tests\Feature;

use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DjenTriageTest extends TestCase
{
    use RefreshDatabase;

    public function test_triage_filter_returns_only_communications_without_a_case(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('djen.visualizar', 'api'));
        $case = Caso::factory()->create();
        $unlinked = $this->communication();
        $this->communication(['caso_id' => $case->id]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/comunicacoes-djen?sem_caso=1')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.id', $unlinked->id);
    }

    public function test_triage_can_filter_unlinked_communications_by_unread_court_and_date(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('djen.visualizar', 'api'));
        $matching = $this->communication([
            'sigla_tribunal' => 'TRT1',
            'data_disponibilizacao' => '2026-05-15',
            'lida_em' => null,
        ]);
        $this->communication([
            'sigla_tribunal' => 'TJMG',
            'data_disponibilizacao' => '2026-05-15',
            'lida_em' => null,
        ]);
        $this->communication([
            'sigla_tribunal' => 'TRT1',
            'data_disponibilizacao' => '2026-05-15',
            'lida_em' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/comunicacoes-djen?sem_caso=1&somente_nao_lidas=1&sigla_tribunal=TRT1&data_inicio=2026-05-15&data_fim=2026-05-15')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.id', $matching->id);
    }

    public function test_user_with_link_permission_can_move_triage_communication_to_a_case(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('djen.vincular', 'api'));
        $case = Caso::factory()->create();
        $communication = $this->communication();

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/comunicacoes-djen/{$communication->id}/vincular", [
                'caso_id' => $case->id,
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $communication->id)
            ->assertJsonPath('data.caso.id', $case->id);

        $this->assertDatabaseHas('comunicacoes_djen', [
            'id' => $communication->id,
            'caso_id' => $case->id,
        ]);
    }

    private function communication(array $overrides = []): ComunicacaoDjen
    {
        static $sequence = 0;
        $sequence++;

        return ComunicacaoDjen::query()->create(array_merge([
            'djen_id' => 'triage-test-'.$sequence,
            'numero_processo' => '00000000000000000000',
            'sigla_tribunal' => 'TRT1',
            'nome_orgao' => 'Vara de teste',
            'tipo_comunicacao' => 'Intimação',
            'status_djen' => 'P',
            'data_disponibilizacao' => '2026-05-15',
            'texto' => 'Comunicação pública usada em teste automatizado.',
            'link' => 'https://example.test/publicacao',
            'lida_em' => null,
            'caso_id' => null,
            'payload' => [],
        ], $overrides));
    }
}
