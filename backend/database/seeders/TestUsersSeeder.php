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

        // Advogado principal
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

        $perfil->categorias()->sync(
            Categoria::whereIn('nome', ['Direito Civil', 'Direito Trabalhista'])->pluck('id')
        );

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

        // Advogados genéricos
        $advogadosData = [
            [
                'user' => [
                    'name'     => 'Ana Carolina Souza',
                    'email'    => 'ana.souza@example.com',
                    'cpf'      => '11122233344',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '234567',
                    'oab_uf'         => 'SP',
                    'celular'        => '11999990001',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Especialista em direito de família e sucessões, com mais de 10 anos de atuação.',
                ],
                'categorias' => ['Direito de Família', 'Direito Sucessório'],
            ],
            [
                'user' => [
                    'name'     => 'Rafael Mendes Costa',
                    'email'    => 'rafael.costa@example.com',
                    'cpf'      => '22233344455',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '345678',
                    'oab_uf'         => 'RJ',
                    'celular'        => '21999990002',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Advogado criminalista com foco em tribunal do júri e habeas corpus.',
                ],
                'categorias' => ['Direito Penal'],
            ],
            [
                'user' => [
                    'name'     => 'Fernanda Lima Rocha',
                    'email'    => 'fernanda.rocha@example.com',
                    'cpf'      => '33344455566',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '456789',
                    'oab_uf'         => 'MG',
                    'celular'        => '31999990003',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Atuação em direito empresarial, contratos e recuperação judicial.',
                ],
                'categorias' => ['Direito Empresarial', 'Direito Contratual'],
            ],
            [
                'user' => [
                    'name'     => 'Lucas Ferreira Alves',
                    'email'    => 'lucas.alves@example.com',
                    'cpf'      => '44455566677',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '567890',
                    'oab_uf'         => 'RS',
                    'celular'        => '51999990004',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Especialista em direito tributário e planejamento fiscal para empresas.',
                ],
                'categorias' => ['Direito Tributário'],
            ],
            [
                'user' => [
                    'name'     => 'Camila Nunes Barbosa',
                    'email'    => 'camila.barbosa@example.com',
                    'cpf'      => '55566677788',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '678901',
                    'oab_uf'         => 'BA',
                    'celular'        => '71999990005',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Advogada previdenciária com experiência em aposentadorias e benefícios do INSS.',
                ],
                'categorias' => ['Direito Previdenciário'],
            ],
        ];

        foreach ($advogadosData as $item) {
            $user = User::updateOrCreate(
                ['email' => $item['user']['email']],
                $item['user']
            );
            $user->syncRoles([RoleEnum::ADVOGADO->value]);

            $perfil = Advogado::updateOrCreate(
                ['user_id' => $user->id],
                $item['perfil']
            );

            $perfil->categorias()->sync(
                Categoria::whereIn('nome', $item['categorias'])->pluck('id')
            );
        }
    }
}