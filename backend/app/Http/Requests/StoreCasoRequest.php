<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCasoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        if ($this->numero_processo) {
            $this->merge([
                'numero_processo' => preg_replace('/\D/', '', $this->numero_processo),
            ]);
        }
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
            'categorias.*'      => 'integer|exists:categorias,id',
            'clientes'          => 'nullable|array',
            'clientes.*.id'     => 'required|uuid|exists:clientes,id',
            'clientes.*.papel'  => 'nullable|in:autor,réu,interveniente,testemunha',
            'anexos'            => 'nullable|array',
            'anexos.*'          => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'validation.titulo.required',
            'titulo.string' => 'validation.titulo.string',
            'titulo.max' => 'validation.titulo.max',
            'numero_processo.unique' => 'validation.numero_processo.unique',
            'status.in' => 'validation.status.in',
            'data_abertura.required' => 'validation.data_abertura.required',
            'data_abertura.date' => 'validation.data_abertura.invalid',
            'data_encerramento.date' => 'validation.data_encerramento.invalid',
            'data_encerramento.after_or_equal' => 'validation.data_encerramento.after_or_equal',
            'anexos.array' => 'validation.anexos.array',
            'anexos.*.mimes' => 'validation.anexos.arquivo.mimes',
            'anexos.*.max' => 'validation.anexos.arquivo.max',
        ];
    }
}
