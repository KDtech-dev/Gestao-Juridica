<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnderecoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'logradouro'  => $this->logradouro,
            'numero'      => $this->numero,
            'complemento' => $this->complemento,
            'bairro'      => $this->bairro,
            'cidade'      => $this->cidade,
            'uf'          => $this->uf,
            'cep'         => $this->cep,
        ];
    }
}
 
