<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComunicacaoDjenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero_processo' => $this->numero_processo,
            'sigla_tribunal' => $this->sigla_tribunal,
            'nome_orgao' => $this->nome_orgao,
            'tipo_comunicacao' => $this->tipo_comunicacao,
            'data_disponibilizacao' => $this->data_disponibilizacao?->toDateString(),
            'texto' => $this->texto,
            'link' => $this->link,
            'lida' => ! is_null($this->lida_em),
            'lida_em' => $this->lida_em?->toISOString(),
            'caso' => $this->whenLoaded('caso', fn() => [
                'id' => $this->caso->id,
                'titulo' => $this->caso->titulo,
                'numero_processo' => $this->caso->numero_processo,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
