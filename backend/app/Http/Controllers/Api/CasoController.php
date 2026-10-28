<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCasoRequest;
use App\Http\Requests\UpdateCasoRequest;
use App\Http\Requests\SyncClientesCasoRequest;
use App\Http\Resources\CasoResource;
use App\Models\Anexo;
use App\Models\Caso;
use App\Services\CasoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CasoController extends Controller
{
    public function __construct(protected CasoService $casoService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'area_direito' => ['sometimes', 'nullable', 'string', 'max:100'],
            'categoria_id' => ['sometimes', 'nullable', 'integer'],
            'advogado_id' => ['sometimes', 'nullable', 'uuid'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ]);
        $casos = $this->casoService->getCasos(
            $filters,
            (int) ($filters['per_page'] ?? 15),
        );

        return response()->json([
            'data'  => CasoResource::collection($casos),
            'meta'  => [
                'current_page' => $casos->currentPage(),
                'per_page'     => $casos->perPage(),
                'total'        => $casos->total(),
                'last_page'    => $casos->lastPage(),
            ],
            'links' => [
                'first' => $casos->url(1),
                'last'  => $casos->url($casos->lastPage()),
                'prev'  => $casos->previousPageUrl(),
                'next'  => $casos->nextPageUrl(),
            ],
        ]);
    }

    public function store(StoreCasoRequest $request): JsonResponse
    {
        $caso = $this->casoService->createCaso($request->validated());

        return response()->json(new CasoResource($caso), 201);
    }

    public function show(string $id): JsonResponse
    {
        $caso = $this->casoService->getCasoById($id);

        return response()->json(new CasoResource($caso));
    }

    public function update(UpdateCasoRequest $request, Caso $caso): JsonResponse
    {
        $caso = $this->casoService->updateCaso($caso, $request->validated());

        return response()->json(new CasoResource($caso));
    }

    public function destroy(Caso $caso): JsonResponse
    {
        $this->casoService->deleteCaso($caso);

        return response()->json(['message' => 'Caso excluído com sucesso.']);
    }

    public function syncClientes(SyncClientesCasoRequest $request, Caso $caso): JsonResponse
    {
        $caso = $this->casoService->syncClientes($caso, $request->validated('clientes'));

        return response()->json(new CasoResource($caso));
    }

    public function attachClientes(SyncClientesCasoRequest $request, Caso $caso): JsonResponse
    {
        $caso = $this->casoService->attachClientes($caso, $request->validated('clientes'));

        return response()->json(new CasoResource($caso));
    }

    public function detachCliente(Caso $caso, string $clienteId): JsonResponse
    {
        $this->casoService->detachCliente($caso, $clienteId);

        return response()->json(['message' => 'Cliente desvinculado do caso.']);
    }

    public function visualizarAnexo(Caso $caso, Anexo $anexo)
    {
        abort_unless(
            $anexo->anexavel_id === $caso->id &&
                $anexo->anexavel_type === Caso::class,
            404
        );

        abort_unless(
            $anexo->arquivo &&
                str_starts_with($anexo->arquivo, "casos/{$caso->id}/anexos/") &&
                Storage::disk('local')->exists($anexo->arquivo),
            404
        );

        return response()->file(
            Storage::disk('local')->path($anexo->arquivo)
        );
    }

    public function downloadAnexo(Caso $caso, Anexo $anexo)
    {
        abort_unless(
            $anexo->anexavel_id === $caso->id &&
                $anexo->anexavel_type === Caso::class,
            404
        );

        abort_unless(
            $anexo->arquivo &&
                str_starts_with($anexo->arquivo, "casos/{$caso->id}/anexos/") &&
                Storage::disk('local')->exists($anexo->arquivo),
            404
        );

        return Storage::disk('local')->download(
            $anexo->arquivo,
            $anexo->nome_arquivo
        );
    }
}
