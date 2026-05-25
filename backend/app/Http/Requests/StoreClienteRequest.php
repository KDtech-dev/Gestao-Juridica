<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->cpf_cnpj) {
            $this->merge([
                'cpf_cnpj' => preg_replace('/\D/', '', $this->cpf_cnpj),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'cpf_cnpj'       => ['required', 'string', 'min:11', 'max:14', 'unique:clientes,cpf_cnpj'],
            'email'          => ['required', 'email:rfc,dns', 'max:255', 'unique:clientes,email'],
            'telefone'       => ['nullable', 'string', 'max:20'],
            'endereco_id'    => ['nullable', 'exists:enderecos,id'],
            'data_nascimento'=> ['nullable', 'date', 'before:today'],
            'foto_perfil'    => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'O nome é obrigatório.',
            'name.max'             => 'O nome não pode ter mais de 255 caracteres.',
            'cpf_cnpj.required'    => 'O CPF ou CNPJ é obrigatório.',
            'cpf_cnpj.unique'      => 'Este CPF/CNPJ já está cadastrado.',
            'cpf_cnpj.min'         => 'CPF deve ter 11 dígitos e CNPJ 14 dígitos.',
            'email.required'       => 'O e-mail é obrigatório.',
            'email.email'          => 'Informe um e-mail válido.',
            'email.unique'         => 'Este e-mail já está cadastrado.',
            'data_nascimento.date' => 'Informe uma data de nascimento válida.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'foto_perfil.image'    => 'O arquivo deve ser uma imagem.',
            'foto_perfil.mimes'    => 'A imagem deve ser JPG, PNG, GIF ou WebP.',
            'foto_perfil.max'      => 'A imagem não pode ser maior que 5MB.',
        ];
    }
}