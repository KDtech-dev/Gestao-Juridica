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
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompromissoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected CompromissoService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $somenteDoUsuario = $request->query('visao') === 'pessoal';
        $periodo = $request->query('periodo');
        $periodo = in_array($periodo, ['today', 'week', 'month'], true)
            ? $periodo
            : null;

        return response()->json([
            'success' => true,
            'data' => CompromissoResource::collection(
                $this->service->listar($somenteDoUsuario, $periodo)
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
        $compromisso = $this->service->buscar($compromisso);

        return response()->json([
            'success' => true,
            'data' => new CompromissoResource($compromisso),
        ]);
    }

    public function visualizarAnexo(Compromisso $compromisso): StreamedResponse
    {
        return $this->responderAnexo($compromisso, 'inline');
    }

    public function downloadAnexo(Compromisso $compromisso): StreamedResponse
    {
        return $this->responderAnexo($compromisso, 'attachment');
    }

    private function responderAnexo(
        Compromisso $compromisso,
        string $disposition,
    ): StreamedResponse {
        $path = $compromisso->anexo;

        abort_unless(
            $path &&
                str_starts_with($path, 'compromissos/') &&
                Storage::disk('local')->exists($path),
            404,
        );

        $name = basename($path);
        $mime = Storage::disk('local')->mimeType($path) ?: 'application/octet-stream';

        return Storage::disk('local')->response($path, $name, [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition . '; filename="' . addslashes($name) . '"',
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
