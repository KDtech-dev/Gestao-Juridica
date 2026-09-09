<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'cpf'               => $this->cpf,
            'email_verified_at' => $this->email_verified_at,
            'roles'             => $this->getRoleNames(),
            'funcionario'       => $this->whenLoaded(
                'funcionario',
                fn() =>
                $this->funcionario ? new FuncionarioResource($this->funcionario) : null
            ),
            'advogado'          => $this->whenLoaded(
                'advogado',
                fn() =>
                $this->advogado ? new AdvogadoResource($this->advogado) : null
            ),
            'cor_perfil' => $this->cor_perfil,
            'foto_perfil'     => $this->foto_perfil,
            'foto_perfil_url' => $this->foto_perfil_url,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
