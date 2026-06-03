<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FuncionarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'data_nascimento'  => $this->data_nascimento,
            'sexo'             => $this->sexo,
            'celular'          => $this->celular,
            'resumo_pessoal'   => $this->resumo_pessoal,
            'foto_perfil_url'  => $this->foto_perfil
                ? asset('storage/' . $this->foto_perfil)
                : null,
            'endereco'         => $this->whenLoaded('endereco', fn() =>
                $this->endereco ? new EnderecoResource($this->endereco) : null
            ),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}

