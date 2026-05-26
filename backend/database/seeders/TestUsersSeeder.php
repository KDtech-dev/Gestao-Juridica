<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        
        $admin = User::create([
            'email'    => 'teste@email.com',
            'name'     => 'Administrador Teste',
            'password' => Hash::make('123456'),
            'cpf'      => '12345678909',
        ]);
        $admin->syncRoles([RoleEnum::ADMIN->value]);

        $advogado = User::updateOrCreate(
            ['email' => 'advogado@example.com'],
            [
                'name'     => 'Advogado Teste',
                'password' => Hash::make('123456'),
                'cpf'      => '12345678908',
            ]
        );
        $advogado->syncRoles([RoleEnum::ADVOGADO->value]);

        $funcionario = User::updateOrCreate(
            ['email' => 'funcionario@example.com'],
            [
                'name'     => 'Funcionário Teste',
                'password' => Hash::make('123456'),
                'cpf'      => '12345678907',
            ]
        );
        $funcionario->syncRoles([RoleEnum::FUNCIONARIO->value]);
    }
}