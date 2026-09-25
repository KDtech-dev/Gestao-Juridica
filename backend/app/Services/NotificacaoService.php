<?php

namespace App\Services;

use App\Exceptions\WhatsAppEnvioFalhouException;
use App\Models\Compromisso;
use App\Models\Notificacao;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;

class NotificacaoService
{
    private const TIPOS_LEMBRETE_COMPROMISSO = [
        'COMPROMISSO_HOJE',
        'COMPROMISSO_SEMANA',
    ];

    public function __construct(protected WhatsAppService $whatsApp) {}

    public function registrarCompromissoCriado(Compromisso $compromisso): void
    {
        Notificacao::query()
            ->where('usuario_id', $compromisso->user_id)
            ->where('compromisso_id', $compromisso->id)
            ->where('tipo', 'COMPROMISSO_CRIADO')
            ->delete();
    }

    public function sincronizarLembretesCompromissos(User $usuario): void
    {
        $hoje = CarbonImmutable::today();
        $fimDaSemana = $hoje->endOfWeek();

        $this->removerLembretesInvalidos($usuario, $hoje, $fimDaSemana);

        Compromisso::query()
            ->where('user_id', $usuario->id)
            ->where('status', 'PENDENTE')
            ->whereBetween('data', [$hoje->toDateString(), $fimDaSemana->toDateString()])
            ->with('criador.funcionario', 'criador.advogado')
            ->orderBy('data')
            ->orderBy('hora')
            ->get()
            ->each(function (Compromisso $compromisso) use ($hoje) {
                $data = CarbonImmutable::parse($compromisso->data);

                if ($data->isSameDay($hoje)) {
                    $this->criarSeNaoExiste(
                        compromisso: $compromisso,
                        tipo: 'COMPROMISSO_HOJE',
                        titulo: 'Compromisso para hoje',
                        mensagem: $this->formatarMensagemCompromisso($compromisso, 'Você tem um compromisso hoje'),
                        dados: $this->dadosCompromisso($compromisso, 'hoje')
                    );

                    return;
                }

                $this->criarSeNaoExiste(
                    compromisso: $compromisso,
                    tipo: 'COMPROMISSO_SEMANA',
                    titulo: 'Compromisso nesta semana',
                    mensagem: $this->formatarMensagemCompromisso($compromisso, 'Você tem um compromisso nesta semana'),
                    dados: $this->dadosCompromisso($compromisso, 'semana')
                );
            });
    }

    public function sincronizarCompromissoAtualizado(Compromisso $compromisso): void
    {
        $compromisso->refresh();

        $this->removerLembretesDoCompromisso($compromisso);

        if ($compromisso->status !== 'PENDENTE') {
            return;
        }

        $hoje = CarbonImmutable::today();
        $fimDaSemana = $hoje->endOfWeek();
        $data = CarbonImmutable::parse($compromisso->data);

        if ($data->lt($hoje) || $data->gt($fimDaSemana)) {
            return;
        }

        if ($data->isSameDay($hoje)) {
            $this->criarSeNaoExiste(
                compromisso: $compromisso,
                tipo: 'COMPROMISSO_HOJE',
                titulo: 'Compromisso para hoje',
                mensagem: $this->formatarMensagemCompromisso($compromisso, 'Você tem um compromisso hoje'),
                dados: $this->dadosCompromisso($compromisso, 'hoje')
            );

            return;
        }

        $this->criarSeNaoExiste(
            compromisso: $compromisso,
            tipo: 'COMPROMISSO_SEMANA',
            titulo: 'Compromisso nesta semana',
            mensagem: $this->formatarMensagemCompromisso($compromisso, 'Você tem um compromisso nesta semana'),
            dados: $this->dadosCompromisso($compromisso, 'semana')
        );
    }

    public function removerNotificacoesDoCompromisso(Compromisso $compromisso): void
    {
        $this->notificacoesDoCompromisso($compromisso)
            ->each(fn(Notificacao $notificacao) => $notificacao->delete());
    }

    private function criarSeNaoExiste(
        Compromisso $compromisso,
        string $tipo,
        string $titulo,
        string $mensagem,
        array $dados
    ): void {
        $notificacao = Notificacao::query()
            ->where('usuario_id', $compromisso->user_id)
            ->where('compromisso_id', $compromisso->id)
            ->where('tipo', $tipo)
            ->latest()
            ->get()
            ->first(function (Notificacao $notificacao) use ($dados) {
                $notificacaoDados = $notificacao->dados ?? [];

                return (string) ($notificacaoDados['compromisso_id'] ?? '') === (string) $dados['compromisso_id']
                    && ($notificacaoDados['janela'] ?? null) === $dados['janela'];
            });

        if ($notificacao) {
            $notificacao->update([
                'titulo' => $titulo,
                'mensagem' => $mensagem,
                'dados' => $dados,
            ]);

            return;
        }

        $notificacao = Notificacao::create([
            'usuario_id' => $compromisso->user_id,
            'compromisso_id' => $compromisso->id,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensagem' => $mensagem,
            'dados' => $dados,
        ]);

        if ($tipo === 'COMPROMISSO_HOJE') {
            $this->enviarWhatsAppSeNecessario($notificacao, $compromisso, $mensagem);
        }
    }

    private function enviarWhatsAppSeNecessario(
        Notificacao $notificacao,
        Compromisso $compromisso,
        string $mensagem
    ): void {
        $telefone = $this->resolverTelefone($compromisso->criador);

        if (!$telefone) {
            return;
        }

        dispatch(function () use ($notificacao, $telefone, $mensagem) {
            app(NotificacaoService::class)->enviarWhatsAppJob($notificacao, $telefone, $mensagem);
        })->onQueue('whatsapp');
    }

    public function enviarWhatsAppJob(Notificacao $notificacao, string $telefone, string $mensagem): void
    {
        try {
            $this->whatsApp->enviar($telefone, $mensagem);

            $notificacao->update(['whatsapp_enviado_em' => now()]);
        } catch (WhatsAppEnvioFalhouException $e) {
            Log::warning('Falha ao enviar lembrete de compromisso via WhatsApp', [
                'notificacao_id' => $notificacao->id,
                'compromisso_id' => $compromisso->id ?? null,
                'erro' => $e->getMessage(),
            ]);
        }
    }

    private function resolverTelefone(User $usuario): ?string
    {
        return $usuario->funcionario?->telefone
            ?? $usuario->advogado?->telefone;
    }

    private function dadosCompromisso(Compromisso $compromisso, string $janela): array
    {
        return [
            'compromisso_id' => $compromisso->id,
            'janela' => $janela,
            'data' => $compromisso->data?->format('Y-m-d'),
            'hora' => $compromisso->hora,
            'tipo_compromisso' => $compromisso->tipo,
        ];
    }

    public function removerLembretesDoCompromisso(Compromisso $compromisso): void
    {
        $this->notificacoesDoCompromisso($compromisso)
            ->whereIn('tipo', self::TIPOS_LEMBRETE_COMPROMISSO)
            ->each(fn(Notificacao $notificacao) => $notificacao->delete());
    }

    private function removerLembretesInvalidos(
        User $usuario,
        CarbonImmutable $hoje,
        CarbonImmutable $fimDaSemana
    ): void {
        Notificacao::query()
            ->where('usuario_id', $usuario->id)
            ->whereIn('tipo', self::TIPOS_LEMBRETE_COMPROMISSO)
            ->with('compromisso')
            ->get()
            ->each(function (Notificacao $notificacao) use ($usuario, $hoje, $fimDaSemana) {
                $compromisso = $notificacao->compromisso
                    ?? $this->buscarCompromissoLegado($notificacao);

                if (!$compromisso || $compromisso->user_id !== $usuario->id) {
                    $notificacao->delete();

                    return;
                }

                if (!$notificacao->compromisso_id) {
                    $notificacao->update([
                        'compromisso_id' => $compromisso->id,
                    ]);
                }

                $data = CarbonImmutable::parse($compromisso->data);
                $tipoEsperado = $data->isSameDay($hoje)
                    ? 'COMPROMISSO_HOJE'
                    : 'COMPROMISSO_SEMANA';
                $janelaEsperada = $data->isSameDay($hoje) ? 'hoje' : 'semana';

                $invalida = $compromisso->status !== 'PENDENTE'
                    || $data->lt($hoje)
                    || $data->gt($fimDaSemana)
                    || $notificacao->tipo !== $tipoEsperado;

                if ($invalida) {
                    $notificacao->delete();

                    return;
                }

                $notificacao->update([
                    'titulo' => $tipoEsperado === 'COMPROMISSO_HOJE'
                        ? 'Compromisso para hoje'
                        : 'Compromisso nesta semana',
                    'mensagem' => $this->formatarMensagemCompromisso(
                        $compromisso,
                        $tipoEsperado === 'COMPROMISSO_HOJE'
                            ? 'Você tem um compromisso hoje'
                            : 'Você tem um compromisso nesta semana'
                    ),
                    'dados' => $this->dadosCompromisso($compromisso, $janelaEsperada),
                ]);
            });
    }

    private function notificacoesDoCompromisso(Compromisso $compromisso)
    {
        return Notificacao::query()
            ->where('usuario_id', $compromisso->user_id)
            ->get()
            ->filter(function (Notificacao $notificacao) use ($compromisso) {
                return (string) $notificacao->compromisso_id === (string) $compromisso->id
                    || (string) (($notificacao->dados ?? [])['compromisso_id'] ?? '') === (string) $compromisso->id;
            });
    }

    private function buscarCompromissoLegado(Notificacao $notificacao): ?Compromisso
    {
        $compromissoId = ($notificacao->dados ?? [])['compromisso_id'] ?? null;

        if (!$compromissoId) {
            return null;
        }

        return Compromisso::find($compromissoId);
    }

    private function formatarMensagemCompromisso(Compromisso $compromisso, string $prefixo): string
    {
        $data = CarbonImmutable::parse($compromisso->data)->format('d/m/Y');
        $hora = $compromisso->hora ? " às {$compromisso->hora}" : '';

        return "{$prefixo}: {$compromisso->titulo} em {$data}{$hora}.";
    }
}
