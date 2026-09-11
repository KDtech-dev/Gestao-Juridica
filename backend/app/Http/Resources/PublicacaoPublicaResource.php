<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicacaoPublicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'titulo'         => $this->titulo,
            'resumo'         => $this->resumo,
            'conteudo'       => $this->conteudo,
            'imagem_caminho' => $this->imagem_caminho,
            'imagem_url'      => $this->imagem_url,
            'autor'          => $this->autor,
            'publicado_em'   => $this->publicado_em,
            'created_at'     => $this->created_at,
            'categoria'      => new CategoriaResource($this->whenLoaded('categoria')),
            'anexos'         => $this->whenLoaded(
                'anexos',
                fn() =>
                $this->anexos->map(fn($anexo) => [
                    'id'           => $anexo->uuid,
                    'nome_arquivo' => $anexo->nome_arquivo,
                    'arquivo'      => $anexo->arquivo,
                ])
            ),
        ];
    }
}
