<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;

class AdvogadoPublicoController extends Controller
{
    public function index()
    {
        $advogados = User::role('advogado')
            ->with(['advogado.categorias', 'advogado.endereco'])
            ->get();

        return UserResource::collection($advogados);
    }
}
