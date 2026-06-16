<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCasoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'            => 'sometimes|required|string|max:255',
            'numero_processo' => 'nullable|string|unique:casos,numero_processo,' . $this->caso->id,
            'descricao'         => 'nullable|string',
            'status'            => 'nullable|in:aberto,em_andamento,encerrado,arquivado',
            'data_abertura'     => 'sometimes|required|date',
            'data_encerramento' => 'nullable|date|after_or_equal:data_abertura',
            'advogado_id'       => 'nullable|uuid|exists:users,id',
            'categorias'        => 'nullable|array',
            'categorias.*' => 'integer|exists:categorias,id',
        ];
    }
}
