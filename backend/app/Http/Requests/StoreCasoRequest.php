<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCasoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'            => 'required|string|max:255',
            'numero_processo'   => 'nullable|string|unique:casos,numero_processo',
            'descricao'         => 'nullable|string',
            'status'            => 'nullable|in:aberto,em_andamento,encerrado,arquivado',
            'data_abertura'     => 'required|date',
            'data_encerramento' => 'nullable|date|after_or_equal:data_abertura',
            'advogado_id'       => 'nullable|uuid|exists:users,id',
            'categorias'        => 'nullable|array',
            'categorias.*' => 'integer|exists:categorias,id',
            'clientes'          => 'nullable|array',
            'clientes.*.id'     => 'required|uuid|exists:clientes,id',
            'clientes.*.papel'  => 'nullable|in:autor,réu,interveniente,testemunha',
        ];
    }
}
