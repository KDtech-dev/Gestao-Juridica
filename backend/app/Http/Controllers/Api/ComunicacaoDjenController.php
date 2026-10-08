<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AdvogadoSemOabException;
use App\Exceptions\CasoSemNumeroProcessoException;
use App\Exceptions\DjenIndisponivelException;
use App\Facades\Response;
use App\Http\Controllers\Controller;
use App\Http\Resources\ComunicacaoDjenResource;
use App\Models\Advogado;
use App\Models\Caso;
use App\Models\ComunicacaoDjen;
use App\Services\DjenService;
use Illuminate\Http\Request;

class ComunicacaoDjenController extends Controller
{
    public function __construct(private DjenService $service) {}

    public function index(Request $request)
    {
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

        $comunicacoes = $query->paginate($request->integer('por_pagina', 20));

        return Response::success()
            ->data(ComunicacaoDjenResource::collection($comunicacoes))
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

    public function sincronizarCaso(Caso $caso)
    {
        try {
            $qtd = $this->service->sincronizarCaso($caso, now()->subDays(3));

            return Response::success()
                ->message("{$qtd} comunicação(ões) sincronizada(s).")
                ->data(['sincronizadas' => $qtd])
                ->send();
        } catch (CasoSemNumeroProcessoException | DjenIndisponivelException $e) {
            return Response::error()
                ->message($e->getMessage())
                ->status(422)
                ->send();
        }
    }

    public function sincronizarAdvogado(Advogado $advogado)
    {
        try {
            $qtd = $this->service->sincronizarAdvogado($advogado, now()->subDays(3));

            return Response::success()
                ->message("{$qtd} comunicação(ões) sincronizada(s).")
                ->data(['sincronizadas' => $qtd])
                ->send();
        } catch (AdvogadoSemOabException | DjenIndisponivelException $e) {
            return Response::error()
                ->message($e->getMessage())
                ->status(422)
                ->send();
        }
    }
}
