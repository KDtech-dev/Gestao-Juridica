<?php

namespace App\Services;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Collection;

class CategoriaService
{
    public function listar(): Collection
    {
        return Categoria::query()
            ->select('id', 'nome', 'descricao')
            ->orderBy('nome')
            ->get();
    }
}
