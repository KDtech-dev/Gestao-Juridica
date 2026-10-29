<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AdvogadoSemOabException;
use App\Exceptions\CasoSemNumeroProcessoException;
use App\Exceptions\DjenIndisponivelException;
use App\Facades\Response;
use App\Http\Controllers\Controller;
use App\Http\Resources\ComunicacaoDjenResource;
use App\Http\Resources\DjenSyncRunResource;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Models\DjenSyncRun;
use App\Services\DjenSyncCoordinator;
use Illuminate\Http\Request;

class ComunicacaoDjenController extends Controller
{
    public function __construct(private DjenSyncCoordinator $syncCoordinator) {}

    public function index(Request $request)
    {
        $filtros = $request->validate([
            'por_pagina' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'caso_id' => ['sometimes', 'uuid', 'exists:casos,id'],
            'sigla_tribunal' => ['sometimes', 'string', 'max:20'],
            'data_inicio' => ['sometimes', 'date'],
            'data_fim' => ['sometimes', 'date', 'after_or_equal:data_inicio'],
            'somente_nao_lidas' => ['sometimes', 'boolean'],
        ]);
        $query = ComunicacaoDjen::query()->with('caso')->latest('data_disponibilizacao');

        if ($request->boolean('somente_nao_lidas')) {
            $query->whereNull('lida_em');
        }

        if ($request->filled('caso_id')) {
            $query->where('caso_id', $request->string('caso_id'));
        }

        if ($request->filled('sigla_tribunal')) {
            $query->where('sigla_tribunal', $request->string('sigla_tribunal'));
        }

        if ($request->filled('data_inicio')) {
            $query->whereDate('data_disponibilizacao', '>=', $request->date('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data_disponibilizacao', '<=', $request->date('data_fim'));
        }

        $comunicacoes = $query->paginate($filtros['por_pagina'] ?? 20);

        return Response::success()
            ->data([
                'items' => ComunicacaoDjenResource::collection($comunicacoes)->resolve($request),
                'pagination' => [
                    'current_page' => $comunicacoes->currentPage(),
                    'per_page' => $comunicacoes->perPage(),
                    'last_page' => $comunicacoes->lastPage(),
                    'total' => $comunicacoes->total(),
                ],
            ])
            ->send();
    }

    public function show(ComunicacaoDjen $comunicacaoDjen)
    {
        $comunicacaoDjen->load('caso');

        return Response::success()
            ->data(new ComunicacaoDjenResource($comunicacaoDjen))
            ->send();
    }

    public function marcarLida(ComunicacaoDjen $comunicacaoDjen)
    {
        $comunicacaoDjen->update(['lida_em' => now()]);

        return Response::success()
            ->data(new ComunicacaoDjenResource($comunicacaoDjen))
            ->send();
    }

    public function vincular(Request $request, ComunicacaoDjen $comunicacaoDjen)
    {
        $request->validate(['caso_id' => ['required', 'uuid', 'exists:casos,id']]);

        $comunicacaoDjen->update(['caso_id' => $request->string('caso_id')]);

        return Response::success()
            ->data(new ComunicacaoDjenResource($comunicacaoDjen->load('caso')))
            ->send();
    }

    public function sincronizarCaso(Caso $caso, Request $request)
    {
        try {
            [$run, $created] = $this->syncCoordinator->enqueue($caso, $request->user());

            return Response::success()
                ->message($created ? 'Sincronização adicionada à fila.' : 'Já existe uma sincronização em andamento para este caso.')
                ->data(new DjenSyncRunResource($run))
                ->status($created ? 202 : 200)
                ->send();
        } catch (CasoSemNumeroProcessoException | DjenIndisponivelException $e) {
            return Response::error()
                ->message($e->getMessage())
                ->status(422)
                ->send();
        }
    }

    public function sincronizarAdvogado(Advogado $advogado, Request $request)
    {
        try {
            [$run, $created] = $this->syncCoordinator->enqueue($advogado, $request->user());

            return Response::success()
                ->message($created ? 'Sincronização adicionada à fila.' : 'Já existe uma sincronização em andamento para este advogado.')
                ->data(new DjenSyncRunResource($run))
                ->status($created ? 202 : 200)
                ->send();
        } catch (AdvogadoSemOabException | DjenIndisponivelException $e) {
            return Response::error()
                ->message($e->getMessage())
                ->status(422)
                ->send();
        }
    }

    public function syncRun(DjenSyncRun $djenSyncRun, Request $request)
    {
        abort_unless(
            $request->user()->hasRole('admin') || $djenSyncRun->initiated_by === $request->user()->id,
            403,
        );

        return Response::success()
            ->data(new DjenSyncRunResource($djenSyncRun))
            ->send();
    }
}
