<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\AdvogadoPublicoResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdvogadoPublicoController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $advogados = User::role('advogado')
            ->with(['advogado.categorias'])
            ->get();

        return AdvogadoPublicoResource::collection($advogados);
    }
}