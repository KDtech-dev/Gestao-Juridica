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
            'resumo' => 'nullable|string|max:2000',
            'conteudo' => 'nullable|string',
            'status' => 'sometimes|in:rascunho,publicado,arquivado',
            'publicado_em' => 'nullable|date',
            'anexos' => 'nullable|array',
            'anexos.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'anexos_remover' => 'nullable|array',
            'anexos_remover.*' => 'string|uuid',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.string'          => 'validation.titulo.string',
            'titulo.max'             => 'validation.titulo.max',
            'categoria_id.exists'    => 'validation.categoria_id.exists',
            'imagem.file'            => 'validation.imagem.file',
            'imagem.mimes'           => 'validation.imagem.mimes',
            'imagem.max'             => 'validation.imagem.max',
            'autor.string'           => 'validation.autor.string',
            'autor.max'              => 'validation.autor.max',
            'resumo.string'          => 'validation.resumo.string',
            'resumo.max'             => 'validation.resumo.max',
            'conteudo.string'        => 'validation.conteudo.string',
            'status.in'              => 'validation.status.in',
            'publicado_em.date'      => 'validation.publicado_em.date',
            'anexos.array'           => 'validation.anexos.array',
            'anexos.*.mimes'         => 'validation.anexos.arquivo.mimes',
            'anexos.*.max'           => 'validation.anexos.arquivo.max',
            'anexos_remover.array'   => 'validation.anexos_remover.array',
            'anexos_remover.*.uuid'  => 'validation.anexos_remover.uuid',
        ];
    }
}
