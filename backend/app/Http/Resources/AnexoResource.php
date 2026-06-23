<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnexoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'nome_arquivo' => $this->nome_arquivo,
            'descricao'    => $this->descricao,
            'arquivo'      => $this->arquivo,
        ];
    }
}