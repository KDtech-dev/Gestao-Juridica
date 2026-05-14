<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PublicacaoService;
use App\Strategies\PublicacaoPublicaStrategy;

class PostController extends Controller
{
    protected PublicacaoService $service;

    public function __construct()
    {
        $this->service = new PublicacaoService(
            new PublicacaoPublicaStrategy()
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
}