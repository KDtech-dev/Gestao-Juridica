<?php

namespace App\Services;

use App\Models\User;
use App\Models\Funcionario;
use App\Models\Advogado;
use App\Models\Endereco;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function criar(array $dados): User
    {
        return DB::transaction(function () use ($dados) {
            $endereco = Endereco::create($dados['endereco']);

            $user = User::create([
                'name'     => $dados['name'],
                'email'    => $dados['email'],
                'password' => Hash::make($dados['password']),
            ]);

            Funcionario::create([
                'user_id'          => $user->id,
                'telefone'         => $dados['funcionario']['telefone'] ?? null,
                'data_nascimento'  => $dados['funcionario']['data_nascimento'] ?? null,
                'cpf'              => $dados['funcionario']['cpf'] ?? null,
                'endereco_id'      => $endereco->id,
            ]);

            $user->assignRole($dados['role']);

            return $user->load('funcionario.endereco');
        });
    }
    public function listar()
    {
        return User::with('funcionario.endereco')->paginate(15);
    }
}
