<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdvogadoPublicoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'uuid'            => $this->user->id,
            'name'            => $this->user->name,
            'foto_perfil_url' => $this->user->foto_perfil_url,
            'oab_numero'      => $this->oab_numero,
            'oab_uf'          => $this->oab_uf,
            'resumo_pessoal'  => $this->resumo_pessoal,
            'categorias'      => $this->categorias->pluck('nome'),
        ];
    }
}
