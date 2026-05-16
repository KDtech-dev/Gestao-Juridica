<?php

namespace Database\Seeders;

use App\Enums\StatusCompromisso;
use App\Enums\TipoCompromisso;
use App\Models\Compromisso;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CompromissoSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->whereIn('email', [
                'teste@email.com',
                'advogado@example.com',
                'funcionario@example.com',
            ])
            ->get()
            ->keyBy('email');

        if ($users->isEmpty()) {
            return;
        }

        $today = Carbon::today();

        $items = [
            [
                'email' => 'teste@email.com',
                'titulo' => 'Revisão de publicações pendentes',
                'descricao' => 'Alinhar aprovações e prioridades administrativas.',
                'data' => $today->copy()->subDays(2)->toDateString(),
                'hora' => '09:30',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::CONCLUIDO->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Conferência de documentos digitalizados',
                'descricao' => 'Validar documentos recebidos antes da distribuição interna.',
                'data' => $today->copy()->subDay()->toDateString(),
                'hora' => '15:20',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::CONCLUIDO->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Audiência de conciliação',
                'descricao' => 'Processo trabalhista com audiência remota.',
                'data' => $today->toDateString(),
                'hora' => '14:00',
                'tipo' => TipoCompromisso::AUDIENCIA->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Reunião de alinhamento semanal',
                'descricao' => 'Revisar prioridades da semana e distribuição de tarefas.',
                'data' => $today->toDateString(),
                'hora' => '16:00',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Atualizar documentação do cliente',
                'descricao' => 'Conferir documentos recebidos e anexar ao caso.',
                'data' => $today->copy()->addDay()->toDateString(),
                'hora' => '10:15',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Lembrete de cobrança de honorários',
                'descricao' => 'Enviar lembrete ao financeiro sobre parcelas em aberto.',
                'data' => $today->copy()->addDays(2)->toDateString(),
                'hora' => '11:00',
                'tipo' => TipoCompromisso::LEMBRETE->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Prazo para manifestação',
                'descricao' => 'Protocolar manifestação antes do fim do expediente.',
                'data' => $today->copy()->addDays(3)->toDateString(),
                'hora' => '16:30',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Reunião com cliente empresarial',
                'descricao' => 'Discutir estratégia processual e próximos documentos.',
                'data' => $today->copy()->addDays(5)->toDateString(),
                'hora' => '09:00',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Prazo de juntada de comprovantes',
                'descricao' => 'Reunir comprovantes enviados pelo cliente para protocolo.',
                'data' => $today->copy()->addDays(7)->toDateString(),
                'hora' => '13:45',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Audiência de instrução',
                'descricao' => 'Preparar testemunhas e conferir link da sala virtual.',
                'data' => $today->copy()->addDays(10)->toDateString(),
                'hora' => '10:30',
                'tipo' => TipoCompromisso::AUDIENCIA->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Revisar relatórios administrativos',
                'descricao' => 'Conferir indicadores mensais e pendências operacionais.',
                'data' => $today->copy()->addDays(14)->toDateString(),
                'hora' => '08:45',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Lembrete de renovação contratual',
                'descricao' => 'Verificar contratos com vencimento no próximo mês.',
                'data' => $today->copy()->addDays(20)->toDateString(),
                'hora' => '15:00',
                'tipo' => TipoCompromisso::LEMBRETE->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Sessão de julgamento',
                'descricao' => 'Acompanhar pauta no tribunal e registrar resultado.',
                'data' => $today->copy()->addDays(30)->toDateString(),
                'hora' => '14:30',
                'tipo' => TipoCompromisso::AUDIENCIA->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Compromisso cancelado de teste',
                'descricao' => 'Registro mantido para validar status cancelado no calendário.',
                'data' => $today->copy()->addDays(4)->toDateString(),
                'hora' => '17:00',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::CANCELADO->value,
            ],
        ];

        foreach ($items as $item) {
            $user = $users->get($item['email']);

            if (!$user) {
                continue;
            }

            Compromisso::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'titulo' => $item['titulo'],
                    'data' => $item['data'],
                    'hora' => $item['hora'],
                ],
                [
                    'descricao' => $item['descricao'],
                    'tipo' => $item['tipo'],
                    'status' => $item['status'],
                ]
            );
        }
    }
}
