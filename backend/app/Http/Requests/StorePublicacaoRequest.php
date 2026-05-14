<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => [
                'required',
                'string',
                'max:255'
            ],

            'categoria_id' => [
                'nullable',
                'exists:categorias,id'
            ],

            'imagem_caminho' => [
                'nullable',
                'string',
                'max:255'
            ],

            'autor' => [
                'required',
                'string',
                'max:255'
            ],

            'resumo' => [
                'nullable',
                'string'
            ],

            'conteudo' => [
                'nullable',
                'string'
            ],

            'status' => [
                'required',
                Rule::in([
                    'rascunho',
                    'publicado',
                    'arquivado'
                ])
            ],

            'publicado_em' => [
                'nullable',
                'date'
            ],
        ];
    }
}
