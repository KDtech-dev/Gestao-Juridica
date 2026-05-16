<?php

namespace App\Strategies;

use App\Enums\StatusPublicacao;
use App\Interfaces\PublicationStrategyInterface;
use App\Models\Publicacao;

class PublicacaoPublicaStrategy implements PublicationStrategyInterface
{
    public function getAll()
    {
        return Publicacao::query()
            ->select([
                'id',
                'titulo',
                'categoria_id',
                'imagem_caminho',
                'autor',
                'resumo',
                'conteudo',
                'status',
                'publicado_em',
                'created_at',
                'updated_at',
            ])
            ->where('status', StatusPublicacao::PUBLICADO->value)
            ->with(['categoria', 'anexos'])
            ->orderByDesc('publicado_em')
            ->get();
    }

    public function getById(string $id)
    {
        return Publicacao::query()
            ->select([
                'id',
                'titulo',
                'categoria_id',
                'imagem_caminho',
                'autor',
                'resumo',
                'conteudo',
                'status',
                'publicado_em',
                'created_at',
                'updated_at',
            ])
            ->where(
                'status',
                StatusPublicacao::PUBLICADO->value
            )
            ->where('id', $id)
            ->with(['categoria', 'anexos'])
            ->firstOrFail();
    }
    public function create(array $data)
    {
        abort(403, 'Ação não permitida');
    }

    public function update(string $id, array $data)
    {
        abort(403, 'Ação não permitida');
    }

    public function delete(string $id)
    {
        abort(403, 'Ação não permitida');
    }
}
