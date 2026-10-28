<?php

namespace App\Services;

use App\Models\Compromisso;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompromissoService
{
    public function listar(
        bool $somenteDoUsuario = false,
        ?string $periodo = null
    ) {
        $this->expirarVencidos();

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

    public function buscar(Compromisso $compromisso): Compromisso
    {
        $this->expirarVencidos();

        return $compromisso->fresh('criador');
    }

    private function expirarVencidos(): void
    {
        $agora = CarbonImmutable::now();

        $vencidos = Compromisso::query()
            ->where('status', 'PENDENTE')
            ->where(function ($query) use ($agora) {
                $query->whereDate('data', '<', $agora->toDateString())
                    ->orWhere(function ($query) use ($agora) {
                        $query->whereDate('data', $agora->toDateString())
                            ->whereNotNull('hora')
                            ->where('hora', '<=', $agora->format('H:i:s'));
                    });
            })
            ->get();

        if ($vencidos->isEmpty()) {
            return;
        }

        Compromisso::query()
            ->whereIn('id', $vencidos->pluck('id'))
            ->update(['status' => 'CANCELADO']);

        $notificacaoService = app(NotificacaoService::class);

        $vencidos->each(
            fn(Compromisso $compromisso) =>
            $notificacaoService->removerLembretesDoCompromisso($compromisso)
        );
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
                ->store('compromissos', 'local');
        }

        $dados['user_id'] = $dados['user_id'] ?? Auth::id();

        $compromisso = Compromisso::create($dados);

        app(NotificacaoService::class)->registrarCompromissoCriado($compromisso);

        return $compromisso;
    }

    public function atualizar(
        Compromisso $compromisso,
        array $dados
    ): Compromisso {
        unset($dados['starts_at'], $dados['startsAt']);

        if (isset($dados['anexo']) && $dados['anexo'] instanceof UploadedFile) {

            if ($compromisso->anexo) {
                Storage::disk('local')
                    ->delete($compromisso->anexo);
                Storage::disk('public')
                    ->delete($compromisso->anexo);
            }

            $dados['anexo'] = $dados['anexo']
                ->store('compromissos', 'local');
        }

        $compromisso->update($dados);

        app(NotificacaoService::class)->sincronizarCompromissoAtualizado($compromisso);

        return $compromisso;
    }

    public function deletar(Compromisso $compromisso): void
    {
        app(NotificacaoService::class)->removerNotificacoesDoCompromisso($compromisso);

        if ($compromisso->anexo) {
            Storage::disk('local')
                ->delete($compromisso->anexo);
            Storage::disk('public')
                ->delete($compromisso->anexo);
        }

        $compromisso->delete();
    }
}
