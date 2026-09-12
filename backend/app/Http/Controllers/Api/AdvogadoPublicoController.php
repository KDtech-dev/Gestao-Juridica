<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdvogadoPublicoResource;
use App\Models\Advogado;
use App\Services\ResponseService;
use Illuminate\Http\Request;

class AdvogadoPublicoController extends Controller
{
    public function __construct(
        private readonly ResponseService $responseService,
    ) {}

    public function index(Request $request)
    {
        $query = Advogado::with(['user', 'categorias'])
            ->whereHas('user');

        if ($request->filled('categoria')) {
            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias.id', $request->input('categoria'));
            });
        }

        $advogados = $query->get();

        return $this->responseService->success(
            AdvogadoPublicoResource::collection($advogados),
            'Advogados listados com sucesso.'
        );
    }
}
