<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePublicacaoRequest;
use App\Http\Requests\UpdatePublicacaoRequest;
use App\Services\PublicacaoService;

class PublicacaoController extends Controller
{
    public function __construct(
        protected PublicacaoService $service
    ) {}

    public function index()
    {
        return response()->json(
            $this->service->getPublicacoes()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            $this->service->getPublicacaoById($id)
        );
    }

    public function store(StorePublicacaoRequest $request)
    {
        $publicacao = $this->service->createPublicacao(
            $request->validated()
        );

        return response()->json($publicacao, 201);
    }

    public function update(
        UpdatePublicacaoRequest $request,
        string $id
    ) {
        $publicacao = $this->service->updatePublicacao(
            $id,
            $request->validated()
        );

        return response()->json($publicacao);
    }

    public function destroy(string $id)
    {
        $this->service->deletePublicacao($id);

        return response()->json([
            'message' => 'Publicação removida com sucesso'
        ]);
    }
}
