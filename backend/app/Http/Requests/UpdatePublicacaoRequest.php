<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePublicacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => [
                'sometimes',
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
                'sometimes',
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
                'sometimes',
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

            'anexos' => [
                'nullable',
                'array'
            ],

            'anexos.*' => [
                'file',
                'mimes:pdf,doc,docx,jpg,jpeg,png',
                'max:10240'
            ],
        ];
    }
}
