<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CasoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'numero_processo'   => $this->numero_processo,
            'titulo'            => $this->titulo,
            'descricao'         => $this->descricao,
            'status'            => $this->status,
            'data_abertura'     => $this->data_abertura?->format('Y-m-d'),
            'data_encerramento' => $this->data_encerramento?->format('Y-m-d'),
            'advogado'          => $this->whenLoaded('advogado', fn() => [
                'id'   => $this->advogado->id,
                'name' => $this->advogado->name,
            ]),
            'categorias'        => $this->whenLoaded(
                'categorias',
                fn() =>
                $this->categorias->map(fn($c) => [
                    'id'   => $c->id,
                    'nome' => $c->nome,
                ])
            ),
            'clientes'          => $this->whenLoaded(
                'clientes',
                fn() =>
                $this->clientes->map(fn($cliente) => [
                    'id'      => $cliente->id,
                    'name'    => $cliente->name,
                    'email'   => $cliente->email,
                    'telefone' => $cliente->telefone,
                    'papel'   => $cliente->pivot->papel,
                ])
            ),
            'anexos' => $this->whenLoaded(
                'anexos',
                fn() =>
                $this->anexos->map(fn($anexo) => [
                    'id'      => $anexo->uuid,
                    'nome'    => $anexo->nome_arquivo,
                    'viewUrl' => $anexo->arquivo
                        ? asset('storage/' . $anexo->arquivo)
                        : null,
                ])
            ),
            'created_at'        => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
