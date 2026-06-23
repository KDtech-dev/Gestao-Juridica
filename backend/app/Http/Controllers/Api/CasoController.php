<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCasoRequest;
use App\Http\Requests\UpdateCasoRequest;
use App\Http\Requests\SyncClientesCasoRequest;
use App\Http\Resources\AnexoResource;
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
        $casos = $this->casoService->getCasos(
            $request->only(['search', 'status', 'categoria_id', 'advogado_id'])
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

    public function indexAnexos(Caso $caso): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => AnexoResource::collection($caso->anexos),
        ]);
    }

    public function storeAnexo(Request $request, Caso $caso): JsonResponse
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'nome'    => 'nullable|string|max:255',
        ]);

        $file = $request->file('arquivo');
        $path = $file->storePublicly("casos/{$caso->id}/anexos", 'public');

        $anexo = $caso->anexos()->create([
            'nome_arquivo' => $request->input('nome') ?? $file->getClientOriginalName(),
            'arquivo'      => $path,
        ]);

        return response()->json([
            'success' => true,
            'data'    => new AnexoResource($anexo),
        ], 201);
    }

    public function destroyAnexo(Caso $caso, Anexo $anexo): JsonResponse
    {
        Storage::disk('public')->delete($anexo->arquivo);
        $anexo->delete();
        return response()->json([
            'success' => true,
            'data'    => null,
        ]);
    }
}
