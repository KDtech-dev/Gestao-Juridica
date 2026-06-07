<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'cpf'      => ['required', 'string', 'size:11', 'unique:users,cpf'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'role'     => ['required', 'string', 'in:funcionario,advogado,admin'],

            'endereco'                  => ['nullable', 'array'],
            'endereco.logradouro'       => ['required_with:endereco', 'string', 'max:255'],
            'endereco.numero'           => ['required_with:endereco', 'string', 'max:20'],
            'endereco.complemento'      => ['nullable', 'string', 'max:100'],
            'endereco.bairro'           => ['required_with:endereco', 'string', 'max:100'],
            'endereco.cidade'           => ['required_with:endereco', 'string', 'max:100'],
            'endereco.uf'               => ['required_with:endereco', 'string', 'size:2'],
            'endereco.cep'              => ['required_with:endereco', 'string', 'size:8'],

            'funcionario'                       => ['nullable', 'array'],
            'funcionario.data_nascimento'       => ['nullable', 'date', 'before:today'],
            'funcionario.sexo'                  => ['nullable', 'in:masculino,feminino,outro,prefiro_nao_dizer'],
            'funcionario.celular'               => ['nullable', 'string', 'max:20'],
            'funcionario.resumo_pessoal'        => ['nullable', 'string', 'max:2000'],
            'funcionario.foto_perfil'           => ['nullable', 'string', 'max:500'],

            'advogado'                          => ['nullable', 'array'],
            'advogado.data_nascimento'          => ['nullable', 'date', 'before:today'],
            'advogado.sexo'                     => ['nullable', 'in:masculino,feminino,outro,prefiro_nao_dizer'],
            'advogado.celular'                  => ['nullable', 'string', 'max:20'],
            'advogado.resumo_pessoal'           => ['nullable', 'string', 'max:2000'],
            'advogado.foto_perfil'              => ['nullable', 'string', 'max:500'],
            'advogado.oab_numero'               => ['required_if:role,advogado', 'string', 'max:20', 'unique:advogados,oab_numero'],
            'advogado.oab_uf'                   => ['required_if:role,advogado', 'string', 'size:2'],
            'advogado.especialidade'            => ['nullable', 'array'],
            'advogado.especialidade.*'          => ['string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in'                       => 'A role deve ser: funcionario, advogado ou admin.',
            'cpf.size'                       => 'O CPF deve ter exatamente 11 dígitos (sem pontuação).',
            'advogado.oab_numero.required_if' => 'O número da OAB é obrigatório para advogados.',
            'advogado.oab_uf.required_if'     => 'A UF da OAB é obrigatória para advogados.',
            'endereco.uf.size'               => 'A UF do endereço deve ter 2 caracteres.',
            'endereco.cep.size'              => 'O CEP deve ter exatamente 8 dígitos (sem hífen).',
        ];
    }
}