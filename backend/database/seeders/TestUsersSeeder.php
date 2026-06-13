<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Advogado;
use App\Models\Categoria;
use App\Models\Funcionario;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::updateOrCreate(
            ['email' => 'teste@email.com'],
            [
                'name'     => 'Administrador Teste',
                'password' => Hash::make('123456'),
                'cpf'      => '12345678909',
            ]
        );
        $admin->syncRoles([RoleEnum::ADMIN->value]);

        // Advogado
        $advogado = User::updateOrCreate(
            ['email' => 'advogado@example.com'],
            [
                'name'     => 'Advogado Teste',
                'password' => Hash::make('123456'),
                'cpf'      => '12345678908',
            ]
        );
        $advogado->syncRoles([RoleEnum::ADVOGADO->value]);

        $perfil = Advogado::updateOrCreate(
            ['user_id' => $advogado->id],
            [
                'oab_numero'     => '123456',
                'oab_uf'         => 'MG',
                'celular'        => '38999990001',
                'sexo'           => 'masculino',
                'resumo_pessoal' => 'Advogado especialista em direito civil e trabalhista.',
            ]
        );

        $categorias = Categoria::whereIn('nome', [
            'Direito Civil',
            'Direito Trabalhista',
        ])->pluck('id');

        $perfil->categorias()->sync($categorias);

        // Funcionário
        $funcionario = User::updateOrCreate(
            ['email' => 'funcionario@example.com'],
            [
                'name'     => 'Funcionário Teste',
                'password' => Hash::make('123456'),
                'cpf'      => '12345678907',
            ]
        );
        $funcionario->syncRoles([RoleEnum::FUNCIONARIO->value]);

        Funcionario::updateOrCreate(
            ['user_id' => $funcionario->id],
            [
                'celular'         => '38999990002',
                'sexo'            => 'feminino',
                'data_nascimento' => '1995-04-22',
                'resumo_pessoal'  => 'Assistente administrativo com experiência em gestão de processos.',
            ]
        );
    }
}