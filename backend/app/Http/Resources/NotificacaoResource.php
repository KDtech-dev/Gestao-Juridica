<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'compromisso_id' => $this->compromisso_id,
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'mensagem' => $this->mensagem,
            'dados' => $this->dados ?? [],
            'lida_em' => $this->lida_em?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
