<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdvogadoPublicoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'cor_perfil' => $this->cor_perfil,
            'advogado'   => $this->advogado ? [
                'resumo_pessoal'  => $this->advogado->resumo_pessoal,
                'foto_perfil_url' => $this->advogado->foto_perfil_url,
                'oab_numero'      => $this->advogado->oab_numero,
                'oab_uf'          => $this->advogado->oab_uf,
                'categorias'      => $this->advogado->categorias->map(fn($c) => [
                    'id'   => $c->id,
                    'nome' => $c->nome,
                ]),
            ] : null,
        ];
    }
}
