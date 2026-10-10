<?php

namespace App\Services;

use App\Models\Compromisso;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CompromissoService
{
    public function listar(
        bool $somenteDoUsuario = false,
        ?string $periodo = null
    )
    {
        $hoje = CarbonImmutable::today();
        $query = Compromisso::query()
            ->with('criador')
            ->orderBy('data')
            ->orderBy('hora');

        if ($somenteDoUsuario) {
            $query->where('user_id', Auth::id());
        }

        if ($periodo) {
            $query->where('status', '!=', 'CANCELADO');
            $this->aplicarFiltroPeriodo($query, $periodo, $hoje);
        }

        return $query->get();
    }

    private function aplicarFiltroPeriodo($query, string $periodo, CarbonImmutable $hoje): void
    {
        if ($periodo === 'today') {
            $query->whereDate('data', $hoje->toDateString());

            return;
        }

        if ($periodo === 'week') {
            $query->whereBetween('data', [
                $hoje->toDateString(),
                $hoje->endOfWeek()->toDateString(),
            ]);

            return;
        }

        if ($periodo === 'month') {
            $query->whereBetween('data', [
                $hoje->toDateString(),
                $hoje->endOfMonth()->toDateString(),
            ]);
        }
    }

    public function criar(array $dados): Compromisso
    {
        unset($dados['starts_at'], $dados['startsAt']);

        if (isset($dados['anexo']) && $dados['anexo'] instanceof UploadedFile) {
            $dados['anexo'] = $dados['anexo']
                ->store('compromissos', 'public');
        }

        $dados['user_id'] =  Auth::id();

        return DB::transaction(function () use ($dados) {
            $compromisso = Compromisso::create($dados);
            app(NotificacaoService::class)->registrarCompromissoCriado($compromisso);
            return $compromisso;
        });
    }

    public function atualizar(
        Compromisso $compromisso,
        array $dados
    ): Compromisso {
        unset($dados['starts_at'], $dados['startsAt']);

        if (isset($dados['anexo']) && $dados['anexo'] instanceof UploadedFile) {

            if ($compromisso->anexo) {
                app(LixeiraService::class)->guardarArquivo('public', $compromisso->anexo);
            }

            $dados['anexo'] = $dados['anexo']
                ->store('compromissos', 'public');
        }

        return DB::transaction(function () use ($compromisso, $dados) {
            $compromisso = Compromisso::lockForUpdate()->findOrFail($compromisso->id);
            $compromisso->update($dados);
            app(NotificacaoService::class)->sincronizarCompromissoAtualizado($compromisso);
            return $compromisso;
        });
    }

    public function deletar(Compromisso $compromisso): void
    {
        app(LixeiraService::class)->excluir($compromisso);
        app(NotificacaoService::class)->removerNotificacoesDoCompromisso($compromisso);
    }
}
