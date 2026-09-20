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
            'data' => $this->data?->format('Y-m-d'),
            'hora' => $this->hora ? substr((string) $this->hora, 0, 5) : null,
            'tipo' => $this->tipo,
            'status' => $this->status,
            'anexo' => $this->anexo,
            'criador' => [
                'id' => $this->criador?->id,
                'nome' => $this->criador?->name,
                'cor_perfil' => $this->criador?->cor_perfil,
            ],

            'can' => [
                'update' => $request->user()?->can('update', $this->resource),
                'delete' => $request->user()?->can('delete', $this->resource),
            ],
        ];
    }
}
