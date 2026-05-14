<?php

namespace App\Strategies;

use App\Interfaces\PublicationStrategyInterface;
use App\Models\Publicacao;

class PublicacaoPublicaStrategy implements PublicationStrategyInterface
{
    public function getAll()
    {
        return Publicacao::where('status', 'publicado')
            ->orderByDesc('publicado_em')
            ->get();
    }

    public function getById(string $id)
    {
        return Publicacao::where('status', 'publicado')
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return Publicacao::create($data);
    }

    public function update(string $id, array $data)
    {
        $publicacao = Publicacao::findOrFail($id);

        $publicacao->update($data);

        return $publicacao;
    }

    public function delete(string $id)
    {
        $publicacao = Publicacao::findOrFail($id);

        return $publicacao->delete();
    }
}