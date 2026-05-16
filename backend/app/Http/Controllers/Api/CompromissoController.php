<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compromisso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\CompromissoService;
use App\Http\Resources\CompromissoResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\StoreCompromissoRequest;
use App\Http\Requests\UpdateCompromissoRequest;

class CompromissoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected CompromissoService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $somenteDoUsuario = $request->query('visao') === 'pessoal';

        return response()->json([
            'success' => true,
            'data' => CompromissoResource::collection(
                $this->service->listar($somenteDoUsuario)
            ),
        ]);
    }

    public function store(
        StoreCompromissoRequest $request
    ): JsonResponse {
        $compromisso = $this->service
            ->criar($request->validated());

        return response()->json([
            'success' => true,
            'data' => new CompromissoResource($compromisso),
        ]);
    }

    public function show(Compromisso $compromisso): JsonResponse
    {
        $compromisso->load('criador');

        return response()->json([
            'success' => true,
            'data' => new CompromissoResource($compromisso),
        ]);
    }

    public function update(
        UpdateCompromissoRequest $request,
        Compromisso $compromisso
    ): JsonResponse {
        $this->authorize('update', $compromisso);

        $compromisso = $this->service
            ->atualizar(
                $compromisso,
                $request->validated()
            );

        return response()->json([
            'success' => true,
            'data' => new CompromissoResource($compromisso),
        ]);
    }

    public function destroy(
        Compromisso $compromisso
    ): JsonResponse {
        $this->authorize('delete', $compromisso);

        $this->service->deletar($compromisso);

        return response()->json([
            'success' => true,
        ]);
    }
}
