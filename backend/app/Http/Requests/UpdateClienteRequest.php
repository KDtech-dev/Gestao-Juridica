<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'cpf_cnpj' => $this->cpf_cnpj
                ? preg_replace('/\D/', '', $this->cpf_cnpj)
                : null,

            'data_nascimento' => $this->data_nascimento ?: null,
        ]);
    }

    public function rules(): array
    {
        $clienteId = $this->route('cliente')?->id ?? $this->route('cliente');

        return [
            'name'            => ['sometimes', 'string', 'max:255'],
            'cpf_cnpj'        => [
                'sometimes',
                'string',
                'min:11',
                'max:14',
                Rule::unique('clientes', 'cpf_cnpj')->ignore($clienteId),
            ],
            'email'           => [
                'sometimes',
                'nullable',
                'email:rfc,dns',
                'max:255',
                Rule::unique('clientes', 'email')->ignore($clienteId),
            ],
            'telefone'        => ['nullable', 'string', 'max:20'],
            'endereco_id'     => ['nullable', 'exists:enderecos,id'],
            'data_nascimento' => ['nullable', 'date', 'before:today'],
            'foto_perfil'     => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'validation.name.required',
            'name.max'               => 'validation.name.max',
            'cpf_cnpj.required'      => 'validation.cpf_cnpj.required',
            'cpf_cnpj.unique'        => 'validation.cpf_cnpj.unique',
            'cpf_cnpj.min'           => 'validation.cpf_cnpj.invalid',
            'email.required'         => 'validation.email.required',
            'email.email'            => 'validation.email.invalid',
            'email.unique'           => 'validation.email.unique',
            'data_nascimento.date'   => 'validation.data_nascimento.invalid',
            'data_nascimento.before' => 'validation.data_nascimento.before',
            'foto_perfil.image'      => 'validation.foto_perfil.image',
            'foto_perfil.mimes'      => 'validation.foto_perfil.mimes',
            'foto_perfil.max'        => 'validation.foto_perfil.max',
        ];
    }
}
