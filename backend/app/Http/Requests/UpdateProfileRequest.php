<?php

namespace App\Http\Requests;

use App\Models\User;

class UpdateProfileRequest extends UpdateUserRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        if (isset($data['cpf'])) {
            $data['cpf'] = preg_replace('/\D/', '', $data['cpf']);
        }
        if (isset($data['cor_perfil'])) {
            $data['cor_perfil'] = strtolower($data['cor_perfil']);
        }

        $this->replace($data);
    }

    public function rules(): array
    {
        $rules = parent::rules();
        unset($rules['password'], $rules['role'], $rules['advogado.foto_perfil'], $rules['funcionario.foto_perfil']);
        $rules['role'] = ['prohibited'];
        $rules['password'] = ['prohibited'];
        $rules['user_id'] = ['prohibited'];
        $rules['id'] = ['prohibited'];
        $rules['advogado'] = $this->user()->advogado
            ? ['sometimes', 'nullable', 'array:data_nascimento,sexo,celular,resumo_pessoal,oab_numero,oab_uf,categorias']
            : ['prohibited'];
        $rules['funcionario'] = $this->user()->funcionario
            ? ['sometimes', 'nullable', 'array:data_nascimento,sexo,celular,resumo_pessoal']
            : ['prohibited'];
        $rules['endereco'] = ['sometimes', 'nullable', 'array:logradouro,numero,complemento,bairro,cidade,uf,cep'];

        return $rules;
    }

    protected function targetUser(): ?User
    {
        return $this->user();
    }
}
