<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'titulo'         => $this->titulo,
            'resumo'         => $this->resumo,
            'conteudo'       => $this->conteudo,
            'imagem_caminho' => $this->imagem_caminho,
            'autor'          => $this->autor,
            'status'         => $this->status,
            'publicado_em'   => $this->publicado_em,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
            'categoria_id'   => $this->categoria_id,
            'categoria'      => new CategoriaResource($this->whenLoaded('categoria')),
            'user'           => $this->whenLoaded('user', fn() => [
                'name'  => $this->user->name,
                'nome'  => $this->user->nome ?? null,
                'email' => $this->user->email,
            ]),
            'anexos' => AnexoResource::collection($this->whenLoaded('anexos')),

        ];
    }
}
