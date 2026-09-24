<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Override;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        if (isset($data['cpf'])) {
            $data['cpf'] = preg_replace('/\D/', '', $data['cpf']);
        }

        if (isset($data['funcionario']['data_nascimento'])) {
            $data['funcionario']['data_nascimento'] = $this->formatDate($data['funcionario']['data_nascimento']);
        }
        if (isset($data['advogado']['data_nascimento'])) {
            $data['advogado']['data_nascimento'] = $this->formatDate($data['advogado']['data_nascimento']);
        }

        if (isset($data['funcionario']['celular'])) {
            $data['funcionario']['celular'] = preg_replace('/\D/', '', $data['funcionario']['celular']);
        }

        if (isset($data['advogado']['celular'])) {
            $data['advogado']['celular'] = preg_replace('/\D/', '', $data['advogado']['celular']);
        }

        if (isset($data['endereco']['cep'])) {
            $data['endereco']['cep'] = preg_replace('/\D/', '', $data['endereco']['cep']);
        }

        $this->replace($data);
    }

    private function formatDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $date;
        }

        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $date, $matches)) {
            return $matches[3] . '-' . $matches[2] . '-' . $matches[1];
        }

        if (preg_match('/^(\d{2})-(\d{2})-(\d{4})$/', $date, $matches)) {
            return $matches[3] . '-' . $matches[2] . '-' . $matches[1];
        }

        return $date;
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
            'advogado.categorias'   => ['nullable', 'array'],
            'advogado.categorias.*' => ['integer', 'exists:categorias,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'password' => 'validation.password',
            'role.in'                       => 'validation.role.in',
            'cpf.size'                       => 'validation.cpf.size',
            'advogado.oab_numero.required_if' => 'validation.oab_numero.required_if',
            'advogado.oab_uf.required_if'     => 'validation.oab_uf.required_if',
            'endereco.uf.size'               => 'validation.uf.size',
            'endereco.cep.size'              => 'validation.cep.size',
        ];
    }
}
