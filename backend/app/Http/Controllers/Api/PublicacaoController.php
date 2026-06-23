<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicacaoRequest;
use App\Http\Requests\UpdatePublicacaoRequest;
use App\Http\Resources\PublicacaoResource;
use App\Models\Anexo;
use App\Models\Publicacao;
use App\Services\PublicacaoService;
use Illuminate\Http\Request;

class PublicacaoController extends Controller
{
    public function __construct(
        protected PublicacaoService $service
    ) {}

    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => PublicacaoResource::collection($this->service->getPublicacoes()),
        ]);
    }

    public function show(string $id)
    {
        return response()->json([
            'success' => true,
            'data'    => new PublicacaoResource($this->service->getPublicacaoById($id)),
        ]);
    }

    public function store(StorePublicacaoRequest $request)
    {
        return response()->json([
            'success' => true,
            'data'    => new PublicacaoResource($this->service->createPublicacao($request->validated())),
        ], 201);
    }

    public function update(UpdatePublicacaoRequest $request, string $id)
    {
        $publicacao = $this->service->updatePublicacao(
            $id,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'data'    => new PublicacaoResource($publicacao),
        ]);
    }
    public function destroy(string $id)
    {
        $this->service->deletePublicacao($id);
        return response()->json([
            'success' => true,
            'data'    => null,
        ]);
    }

    public function indexAnexos(Publicacao $publicacao)
    {
        return response()->json([
            'success' => true,
            'data' => $publicacao->anexos,
        ]);
    }

    public function storeAnexo(
        Request $request,
        Publicacao $publicacao
    ) {
        $request->validate([
            'arquivo' => 'required|file|mimes,doc,docx,jpg,jpeg,png|max:10240',
        ]);

        $anexo = $this->service->uploadAnexo(
            $publicacao,
            $request->file('arquivo')
        );

        return response()->json([
            'success' => true,
            'data' => $anexo,
        ], 201);
    }

    public function destroyAnexo(
        Publicacao $publicacao,
        Anexo $anexo
    ) {
        $this->service->deleteAnexo(
            $publicacao,
            $anexo
        );

        return response()->json([
            'success' => true,
            'data' => null,
        ]);
    }

    public function storeBanner(
        Request $request,
        Publicacao $publicacao
    ) {
        $request->validate([
            'imagem' => 'required|image|max:10240',
        ]);

        $publicacao = $this->service->uploadBanner(
            $publicacao,
            $request->file('imagem')
        );

        return response()->json([
            'success' => true,
            'data' => new PublicacaoResource($publicacao),
        ]);
    }
}
