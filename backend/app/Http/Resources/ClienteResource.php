<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'cpf_cnpj'        => $this->cpf_cnpj,
            'email'           => $this->email,
            'telefone'        => $this->telefone,
            'data_nascimento' => $this->data_nascimento?->format('d/m/Y'),
            'foto_perfil_url' => $this->foto_perfil
                ? asset('storage/' . $this->foto_perfil)
                : null,
            'endereco'        => $this->whenLoaded('endereco'),
            'created_at'      => $this->created_at?->format('d/m/Y H:i'),
        ];
    }
}
