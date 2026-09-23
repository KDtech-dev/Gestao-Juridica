<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCasoRequest extends FormRequest
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
            'titulo'            => 'sometimes|required|string|max:255',
            'numero_processo'   => 'nullable|string|unique:casos,numero_processo,' . $this->caso->id,
            'descricao'         => 'nullable|string',
            'status'            => 'nullable|in:aberto,em_andamento,encerrado,arquivado',
            'data_abertura'     => 'sometimes|required|date',
            'data_encerramento' => 'nullable|date|after_or_equal:data_abertura',
            'advogado_id'       => 'nullable|uuid|exists:users,id',
            'categorias'        => 'nullable|array',
            'categorias.*'      => 'integer|exists:categorias,id',
            'anexos'            => 'nullable|array',
            'anexos.*'          => 'file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'anexos_remover'   => 'nullable|array',
            'anexos_remover.*' => 'string|uuid|exists:anexos,uuid',
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
            'anexos_remover.array' => 'validation.anexos_remover.array',
            'anexos_remover'   => 'nullable|array',
            'anexos_remover.*' => 'string|uuid|exists:anexos,uuid',
            'anexos_remover.*.exists' => 'validation.anexos_remover.exists',
        ];
    }
}
