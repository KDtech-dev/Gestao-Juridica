<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'categoria_id' => 'nullable|exists:categorias,id',
            'imagem_caminho' => 'nullable|string|max:255',
            'imagem' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'autor' => 'required|string|max:255',
            'resumo' => 'nullable|string|max:2000',
            'conteudo' => 'nullable|string',
            'status' => 'required|in:rascunho,publicado,arquivado',
            'publicado_em' => 'nullable|date',
            'anexos' => 'nullable|array',
            'anexos.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'validation.titulo.required',
            'titulo.string' => 'validation.titulo.string',
            'titulo.max' => 'validation.titulo.max',
            'categoria_id.exists' => 'validation.categoria_id.exists',
            'imagem_caminho.string' => 'validation.imagem_caminho.string',
            'imagem_caminho.max' => 'validation.imagem_caminho.max',
            'imagem.file' => 'validation.imagem.file',
            'imagem.mimes' => 'validation.imagem.mimes',
            'imagem.max' => 'validation.imagem.max',
            'autor.required' => 'validation.autor.required',
            'autor.string' => 'validation.autor.string',
            'autor.max' => 'validation.autor.max',
            'resumo.string' => 'validation.resumo.string',
            'resumo.max' => 'validation.resumo.max',
            'conteudo.string' => 'validation.conteudo.string',
            'status.required' => 'validation.status.required',
            'status.in' => 'validation.status.in',
            'publicado_em.date' => 'validation.publicado_em.date',
            'anexos.array' => 'validation.anexos.array',
            'anexos.*.arquivo.file' => 'validation.anexos.arquivo.file',
            'anexos.*.arquivo.mimes' => 'validation.anexos.arquivo.mimes',
            'anexos.*.arquivo.max' => 'validation.anexos.arquivo.max',
            'anexos.*.nome.string' => 'validation.anexos.nome.string',
            'anexos.*.nome.max' => 'validation.anexos.nome.max',
        ];
    }
}
