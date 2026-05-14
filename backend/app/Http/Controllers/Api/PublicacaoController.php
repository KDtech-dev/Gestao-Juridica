<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PublicacaoService;
use App\Strategies\PublicacaoAdminStrategy;
use Illuminate\Http\Request;

class PublicacaoController extends Controller
{
    protected PublicacaoService $service;

    public function __construct()
    {
        $this->service = new PublicacaoService(
            new PublicacaoAdminStrategy()
        );
    }

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

    public function store(Request $request)
    {
        $publicacao = $this->service->createPublicacao(
            $request->all()
        );

        return response()->json($publicacao, 201);
    }

    public function update(Request $request, string $id)
    {
        $publicacao = $this->service->updatePublicacao(
            $id,
            $request->all()
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
