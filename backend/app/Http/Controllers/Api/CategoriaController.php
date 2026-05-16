<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoriaResource;
use App\Services\CategoriaService;
use Illuminate\Http\JsonResponse;

class CategoriaController extends Controller
{
    public function __construct(
        protected CategoriaService $categoriaService
    ) {}

    public function index(): JsonResponse
    {
        $categorias = $this->categoriaService->listar();

        return response()->json([
            'success' => true,
            'data' => CategoriaResource::collection($categorias),
        ]);
    }
}
