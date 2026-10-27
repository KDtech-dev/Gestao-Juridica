<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $userAlvo = $this->route('user');
        $userLogado = $this->user();

        if (!$userLogado) return false;

        if ($userLogado->hasRole('admin')) return true;

        return $userLogado->id === $userAlvo->id;
    }
    public function rules(): array
    {
        $user = $this->targetUser();
        $userId = $user?->id;
        $advogadoId = $user?->advogado?->id;

        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'max:255', "unique:users,email,{$userId}"],
            'cpf'      => ['sometimes', 'string', 'size:11', "unique:users,cpf,{$userId}"],
            'password' => ['sometimes', 'confirmed', Password::min(8)->letters()->numbers()],
            'role'     => ['sometimes', 'string', 'in:funcionario,advogado,admin'],
            'permissions' => [$this->user()?->hasRole('admin') ? 'sometimes' : 'prohibited', 'array'],
            'permissions.*' => ['string', 'distinct', 'exists:permissions,name'],
            'cor_perfil' => ['sometimes', 'nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],

            'endereco'                  => ['sometimes', 'nullable', 'array'],
            'endereco.logradouro'       => ['required_with:endereco', 'string', 'max:255'],
            'endereco.numero'           => ['required_with:endereco', 'string', 'max:20'],
            'endereco.complemento'      => ['nullable', 'string', 'max:100'],
            'endereco.bairro'           => ['required_with:endereco', 'string', 'max:100'],
            'endereco.cidade'           => ['required_with:endereco', 'string', 'max:100'],
            'endereco.uf'               => ['required_with:endereco', 'string', 'size:2'],
            'endereco.cep'              => ['required_with:endereco', 'string', 'size:8'],

            'funcionario'                   => ['sometimes', 'nullable', 'array'],
            'funcionario.data_nascimento'   => ['sometimes', 'nullable', 'date', 'before:today'],
            'funcionario.sexo'              => ['sometimes', 'nullable', 'in:masculino,feminino,outro,prefiro_nao_dizer'],
            'funcionario.celular'           => ['sometimes', 'nullable', 'string', 'max:20'],
            'funcionario.resumo_pessoal'    => ['sometimes', 'nullable', 'string', 'max:2000'],
            'funcionario.foto_perfil'       => ['sometimes', 'nullable', 'string', 'max:500'],

            'advogado'                      => ['sometimes', 'nullable', 'array'],
            'advogado.data_nascimento'      => ['sometimes', 'nullable', 'date', 'before:today'],
            'advogado.sexo'                 => ['sometimes', 'nullable', 'in:masculino,feminino,outro,prefiro_nao_dizer'],
            'advogado.celular'              => ['sometimes', 'nullable', 'string', 'max:20'],
            'advogado.resumo_pessoal'       => ['sometimes', 'nullable', 'string', 'max:2000'],
            'advogado.foto_perfil'          => ['sometimes', 'nullable', 'string', 'max:500'],
            'advogado.oab_numero'           => ['sometimes', 'string', 'max:20', "unique:advogados,oab_numero,{$advogadoId}"],
            'advogado.oab_uf'               => ['sometimes', 'string', 'size:2'],
            'advogado.categorias'   => ['sometimes', 'nullable', 'array'],
            'advogado.categorias.*' => ['integer', 'exists:categorias,id'],
        ];
    }

    protected function targetUser(): ?\App\Models\User
    {
        return $this->route('user');
    }

    public function messages(): array
    {
        return [
            'role.in'                       => 'validation.role.in',
            'cpf.size'                       => 'validation.cpf.size',
            'endereco.uf.size'               => 'validation.uf.size',
            'endereco.cep.size'              => 'validation.cep.size',
        ];
    }
}
