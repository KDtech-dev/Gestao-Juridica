<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Advogado;
use App\Models\Categoria;
use App\Models\Funcionario;
use App\Models\User;
use App\Services\ProfileColorService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $admin = $this->updateOrCreateDemoUser('teste@email.com', [
            'name'     => 'Administrador Teste',
            'password' => Hash::make('123456'),
            'cpf'      => '12345678909',
        ]);
        $admin->syncRoles([RoleEnum::ADMIN->value]);

        $advogado = $this->updateOrCreateDemoUser('advogado@example.com', [
            'name'     => 'Advogado Teste',
            'password' => Hash::make('123456'),
            'cpf'      => '12345678908',
        ]);
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

        $funcionario = $this->updateOrCreateDemoUser('funcionario@example.com', [
            'name'     => 'Funcionário Teste',
            'password' => Hash::make('123456'),
            'cpf'      => '12345678907',
        ]);
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
                    'resumo_pessoal' => 'Especialista em direito público, atuando em questões envolvendo o poder público e o interesse coletivo.',
                ],
                'categorias' => ['Direito Público'],
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
                    'resumo_pessoal' => 'Advogado previdenciário com experiência em aposentadorias e benefícios do INSS.',
                ],
                'categorias' => ['Direito Previdenciário'],
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
                    'resumo_pessoal' => 'Atuação em direito trabalhista, defendendo empregados e empregadores em relações de trabalho.',
                ],
                'categorias' => ['Direito Trabalhista'],
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
                    'resumo_pessoal' => 'Especialista em direito civil, contratos, indenizações e obrigações.',
                ],
                'categorias' => ['Direito Civil'],
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
                    'resumo_pessoal' => 'Advogada especialista em direito bancário, contratos e relações financeiras.',
                ],
                'categorias' => ['Direito Bancário'],
            ],
            [
                'user' => [
                    'name'     => 'Bruno Almeida Ribeiro',
                    'email'    => 'bruno.ribeiro@example.com',
                    'cpf'      => '66677788899',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '789012',
                    'oab_uf'         => 'DF',
                    'celular'        => '61999990006',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Atua em consultoria legislativa, elaboração e acompanhamento de projetos de lei.',
                ],
                'categorias' => ['Consultoria Legislativa'],
            ],
            [
                'user' => [
                    'name'     => 'Marina Costa Ferreira',
                    'email'    => 'marina.tributario@example.com',
                    'cpf'      => '77700000001',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900001',
                    'oab_uf'         => 'SP',
                    'celular'        => '11999991001',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Tributário, tributos e planejamento fiscal.',
                ],
                'categorias' => ['Direito Tributário'],
            ],
            [
                'user' => [
                    'name'     => 'Pedro Henrique Martins',
                    'email'    => 'pedro.empresarial@example.com',
                    'cpf'      => '77700000002',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900002',
                    'oab_uf'         => 'RJ',
                    'celular'        => '21999991002',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Empresarial e apoio jurídico a empresas.',
                ],
                'categorias' => ['Direito Empresarial'],
            ],
            [
                'user' => [
                    'name'     => 'Beatriz Almeida Rocha',
                    'email'    => 'beatriz.digital@example.com',
                    'cpf'      => '77700000003',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900003',
                    'oab_uf'         => 'MG',
                    'celular'        => '31999991003',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Digital, tecnologia e proteção de dados.',
                ],
                'categorias' => ['Direito Digital'],
            ],
            [
                'user' => [
                    'name'     => 'Rafael Oliveira Santos',
                    'email'    => 'rafael.imobiliario@example.com',
                    'cpf'      => '77700000004',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900004',
                    'oab_uf'         => 'PR',
                    'celular'        => '41999991004',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Imobiliário e contratos relacionados a imóveis.',
                ],
                'categorias' => ['Direito Imobiliário'],
            ],
            [
                'user' => [
                    'name'     => 'Juliana Ribeiro Alves',
                    'email'    => 'juliana.familia@example.com',
                    'cpf'      => '77700000005',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900005',
                    'oab_uf'         => 'BA',
                    'celular'        => '71999991005',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito de Família e orientação em questões familiares.',
                ],
                'categorias' => ['Direito de Família'],
            ],
            [
                'user' => [
                    'name'     => 'Felipe Nunes Carvalho',
                    'email'    => 'felipe.contratos@example.com',
                    'cpf'      => '77700000006',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900006',
                    'oab_uf'         => 'DF',
                    'celular'        => '61999991006',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em elaboração, análise e negociação de contratos.',
                ],
                'categorias' => ['Contratos'],
            ],
            [
                'user' => [
                    'name'     => 'Camila Souza Mendes',
                    'email'    => 'camila.trabalhista@example.com',
                    'cpf'      => '77700000007',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900007',
                    'oab_uf'         => 'SC',
                    'celular'        => '48999991007',
                    'sexo'           => 'feminino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Trabalhista e relações de trabalho.',
                ],
                'categorias' => ['Direito Trabalhista'],
            ],
            [
                'user' => [
                    'name'     => 'Lucas Mendes Costa',
                    'email'    => 'lucas.civil@example.com',
                    'cpf'      => '77700000008',
                    'password' => Hash::make('123456'),
                ],
                'perfil' => [
                    'oab_numero'     => '900008',
                    'oab_uf'         => 'GO',
                    'celular'        => '62999991008',
                    'sexo'           => 'masculino',
                    'resumo_pessoal' => 'Perfil demonstrativo com atuação em Direito Civil, contratos e responsabilidade civil.',
                ],
                'categorias' => ['Direito Civil'],
            ],
        ];

        foreach ($advogadosData as $item) {
            $categoriaIds = Categoria::whereIn('nome', $item['categorias'])->pluck('id');
            if ($categoriaIds->isEmpty()) {
                continue;
            }

            $email = $item['user']['email'];
            $user = $this->updateOrCreateDemoUser($email, $item['user']);
            $user->syncRoles([RoleEnum::ADVOGADO->value]);

            $perfil = Advogado::updateOrCreate(
                ['user_id' => $user->id],
                $item['perfil']
            );

            $perfil->categorias()->sync($categoriaIds);
        }

        $this->seedLawyersForUnrepresentedCategories();
    }

    private function seedLawyersForUnrepresentedCategories(): void
    {
        Categoria::query()
            ->whereDoesntHave('advogados')
            ->each(function (Categoria $categoria): void {
                $email = "demo.categoria.{$categoria->id}@example.com";
                $user = $this->updateOrCreateDemoUser($email, [
                    'name' => "Advogado de Demonstração - {$categoria->nome}",
                    'cpf' => '987' . str_pad((string) $categoria->id, 8, '0', STR_PAD_LEFT),
                    'password' => Hash::make('123456'),
                ]);
                $user->syncRoles([RoleEnum::ADVOGADO->value]);

                $perfil = Advogado::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'oab_numero' => 'D' . str_pad((string) $categoria->id, 6, '0', STR_PAD_LEFT),
                        'oab_uf' => 'MG',
                        'resumo_pessoal' => "Perfil demonstrativo para a categoria {$categoria->nome}.",
                    ]
                );
                $perfil->categorias()->sync([$categoria->id]);
            });
    }

    /**
     * O DatabaseSeeder raiz suprime eventos do modelo; portanto, o evento
     * creating de User não consegue escolher a cor durante a carga das fixtures.
     */
    private function updateOrCreateDemoUser(string $email, array $attributes): User
    {
        $attributes['email'] = $email;

        if (! User::query()->where('email', $email)->exists()) {
            $attributes['cor_perfil'] = app(ProfileColorService::class)->nextAvailable()
                ?? throw new \RuntimeException('Não há cores de perfil disponíveis para os usuários de demonstração.');
        }

        return User::updateOrCreate(['email' => $email], $attributes);
    }
}
