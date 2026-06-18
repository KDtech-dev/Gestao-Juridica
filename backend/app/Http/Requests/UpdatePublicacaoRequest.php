<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublicacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|string|max:255',
            'categoria_id' => 'nullable|exists:categorias,id',
            'imagem_caminho' => 'nullable|string|max:255',
            'imagem' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'autor' => 'sometimes|string|max:255',
            'resumo' => 'nullable|string',
            'conteudo' => 'nullable|string',
            'status' => 'sometimes|in:rascunho,publicado,arquivado',
            'publicado_em' => 'nullable|date',
            'anexos' => 'nullable|array',
            'anexos.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'anexos_remover' => 'nullable|array',
            'anexos_remover.*' => 'required|exists:anexos,id',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'validation.titulo.required',
            'titulo.string' => 'validation.titulo.string',
            'titulo.max' => 'validation.titulo.max',
            'imagem.mimes' => 'validation.imagem.mimes',
            'autor.required' => 'validation.autor.required',
            'autor.max' => 'validation.autor.max',
            'anexo.mimes' => 'validation.anexo.mimes',
        ];
    }
}
