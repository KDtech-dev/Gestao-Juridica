<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompromissoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'data' => $this->data,
            'hora' => $this->hora,
            'tipo' => $this->tipo,
            'status' => $this->status,
            'anexo' => $this->anexo,
            'criador' => [
                'id' => $this->criador?->id,
                'nome' => $this->criador?->name,
            ],

            'can' => [
                'update' => $request->user()?->can('update', $this->resource),
                'delete' => $request->user()?->can('delete', $this->resource),
            ],
        ];
    }
}