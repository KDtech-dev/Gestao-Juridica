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
        $fimDaSemana = $today->copy()->endOfWeek();
        $estaSemana = function (int $diasAPartirDeHoje) use ($today, $fimDaSemana): string {
            $data = $today->copy()->addDays($diasAPartirDeHoje);

            if ($data->greaterThan($fimDaSemana)) {
                return $fimDaSemana->toDateString();
            }

            return $data->toDateString();
        };

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
                'email' => 'teste@email.com',
                'titulo' => 'Prazo urgente para assinatura digital',
                'descricao' => 'Validar assinatura digital e registrar o protocolo ainda hoje.',
                'data' => $today->toDateString(),
                'hora' => '08:20',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Lembrete de ligação para cliente',
                'descricao' => 'Confirmar recebimento de documentos e pendências cadastrais.',
                'data' => $today->toDateString(),
                'hora' => '10:40',
                'tipo' => TipoCompromisso::LEMBRETE->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Reunião rápida de estratégia',
                'descricao' => 'Definir abordagem para audiência e divisão de tarefas.',
                'data' => $today->toDateString(),
                'hora' => '11:20',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::PENDENTE->value,
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
                'titulo' => 'Triagem de compromissos do dia',
                'descricao' => 'Conferir agenda compartilhada e ajustar responsáveis.',
                'data' => $today->toDateString(),
                'hora' => '17:30',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Atualizar documentação do cliente',
                'descricao' => 'Conferir documentos recebidos e anexar ao caso.',
                'data' => $estaSemana(1),
                'hora' => '10:15',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Preparar minuta de acordo',
                'descricao' => 'Revisar cláusulas sensíveis antes do envio ao cliente.',
                'data' => $estaSemana(1),
                'hora' => '15:10',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Lembrete de cobrança de honorários',
                'descricao' => 'Enviar lembrete ao financeiro sobre parcelas em aberto.',
                'data' => $estaSemana(2),
                'hora' => '11:00',
                'tipo' => TipoCompromisso::LEMBRETE->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Separar anexos para protocolo',
                'descricao' => 'Organizar documentos finais para o prazo da semana.',
                'data' => $estaSemana(2),
                'hora' => '14:20',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Prazo para manifestação',
                'descricao' => 'Protocolar manifestação antes do fim do expediente.',
                'data' => $estaSemana(3),
                'hora' => '16:30',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Revisão de pauta semanal',
                'descricao' => 'Validar compromissos pendentes e redistribuir tarefas críticas.',
                'data' => $estaSemana(3),
                'hora' => '09:50',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'funcionario@example.com',
                'titulo' => 'Conferência de intimações da semana',
                'descricao' => 'Verificar intimações novas e sinalizar prazos curtos.',
                'data' => $estaSemana(4),
                'hora' => '08:55',
                'tipo' => TipoCompromisso::PRAZO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'advogado@example.com',
                'titulo' => 'Reunião com cliente empresarial',
                'descricao' => 'Discutir estratégia processual e próximos documentos.',
                'data' => $estaSemana(5),
                'hora' => '09:00',
                'tipo' => TipoCompromisso::REUNIAO->value,
                'status' => StatusCompromisso::PENDENTE->value,
            ],
            [
                'email' => 'teste@email.com',
                'titulo' => 'Compromisso concluído hoje sem notificação',
                'descricao' => 'Registro concluído para validar filtro de status.',
                'data' => $today->toDateString(),
                'hora' => '18:10',
                'tipo' => TipoCompromisso::COMPROMISSO->value,
                'status' => StatusCompromisso::CONCLUIDO->value,
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
                'data' => $estaSemana(4),
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
