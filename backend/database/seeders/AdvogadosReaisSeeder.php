<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Advogado;
use App\Models\Categoria;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class AdvogadosReaisSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = storage_path('app/imports/advogados-reais.json');

        if (!is_file($jsonPath)) {
            throw new RuntimeException(
                'Arquivo storage/app/imports/advogados-reais.json não encontrado.'
            );
        }

        $privados = json_decode(
            file_get_contents($jsonPath),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $advogados = [
            'manfrine' => [
                'name' => 'Manfrine Chaves de Almeida',
                'oab_numero' => '148359',
                'oab_uf' => 'MG',
                'resumo_pessoal' =>
                    'Especialista em Direito Público, Trabalhista e Civil. Atua na condução estratégica de demandas judiciais e consultivas, aliando conhecimento jurídico e contábil para oferecer soluções seguras e personalizadas.',
                'categorias' => [
                    'Direito Público',
                    'Direito Trabalhista',
                    'Direito Civil',
                ],
                'foto' => 'manfrine.jpeg',
            ],

            'andressa' => [
                'name' => 'Andressa Ferreira Fazendeiro',
                'oab_numero' => '232143',
                'oab_uf' => 'MG',
                'resumo_pessoal' =>
                    'Especialista em Direito Público e Bancário. Atua em demandas contratuais, financeiras e bancárias, oferecendo soluções jurídicas estratégicas para pessoas físicas, empresas e instituições.',
                'categorias' => [
                    'Direito Público',
                    'Direito Bancário',
                ],
                'foto' => 'andressa.jpeg',
            ],

            'carollaine' => [
                'name' => 'Carollaine Damasceno Barros',
                'oab_numero' => '213235',
                'oab_uf' => 'MG',
                'resumo_pessoal' =>
                    'Especialista em Direito Público e Civil, com atuação em assessoria jurídica legislativa e consultoria técnica. Desenvolve pareceres e análises voltadas à gestão pública e ao controle de legalidade.',
                'categorias' => [
                    'Direito Público',
                    'Direito Civil',
                    'Consultoria Legislativa',
                ],
                'foto' => 'carollaine.jpeg',
            ],

            'ariel' => [
                'name' => 'Ariel Mendes',
                'oab_numero' => '247486',
                'oab_uf' => 'MG',
                'resumo_pessoal' => null,
                'categorias' => [],
                'foto' => null,
            ],

            'abraao' => [
                'name' => 'Abraão Lincoln Prates de Almeida',
                'oab_numero' => '248337',
                'oab_uf' => 'MG',
                'resumo_pessoal' =>
                    'Atua nas áreas Trabalhista e Previdenciária, defendendo os direitos dos trabalhadores e segurados, com experiência em ações judiciais e processos administrativos perante o INSS.',
                'categorias' => [
                    'Direito Trabalhista',
                    'Direito Previdenciário',
                ],
                'foto' => 'abraao.jpeg',
            ],
        ];

        foreach ($advogados as $chave => $dados) {
            $privado = $privados[$chave] ?? null;

            if (!$privado) {
                throw new RuntimeException(
                    "Dados privados ausentes para {$chave}."
                );
            }

            foreach (['email', 'cpf', 'data_nascimento'] as $campo) {
                $valor = trim((string) ($privado[$campo] ?? ''));

                if (
                    $valor === '' ||
                    str_contains(strtoupper($valor), 'PREENCHER') ||
                    str_contains(strtoupper($valor), '_REAL') ||
                    str_contains(strtoupper($valor), 'COLOQUE_')
                ) {
                    throw new RuntimeException(
                        "Campo {$campo} inválido para {$chave}."
                    );
                }
            }
        }

        $credenciais = [];

        DB::transaction(function () use (
            $advogados,
            $privados,
            &$credenciais
        ) {
            foreach ($advogados as $chave => $dados) {
                $privado = $privados[$chave];

                $email = strtolower(trim($privado['email']));
                $cpf = preg_replace('/\D/', '', $privado['cpf']);

                $user = User::where('email', $email)
                    ->orWhere('cpf', $cpf)
                    ->first();

                $novo = !$user;

                if (!$user) {
                    $user = new User();
                }

                $user->name = $dados['name'];
                $user->email = $email;
                $user->cpf = $cpf;

                $senhaTemporaria = null;

                if ($novo) {
                    $senhaTemporaria = Str::password(20);
                    $user->password = $senhaTemporaria;
                }

                $user->save();

                $user->syncRoles([
                    RoleEnum::ADVOGADO->value,
                ]);

                $perfil = Advogado::firstOrNew([
                    'user_id' => $user->id,
                ]);

                $perfil->data_nascimento = Carbon::createFromFormat(
                    'd/m/Y',
                    $privado['data_nascimento']
                )->format('Y-m-d');

                $perfil->oab_numero = $dados['oab_numero'];
                $perfil->oab_uf = $dados['oab_uf'];
                $perfil->resumo_pessoal = $dados['resumo_pessoal'];

                if ($dados['foto']) {
                    $origem = base_path(
                        '../frontend/public/images/team/' . $dados['foto']
                    );

                    if (is_file($origem)) {
                        $extensao = pathinfo(
                            $dados['foto'],
                            PATHINFO_EXTENSION
                        );

                        $destino =
                            'advogados/' .
                            Str::slug($dados['name']) .
                            '.' .
                            $extensao;

                        Storage::disk('public')->put(
                            $destino,
                            file_get_contents($origem)
                        );

                        $perfil->foto_perfil = $destino;

                        if (empty($user->foto_perfil)) {
                            $user->foto_perfil = $destino;
                            $user->save();
                        }
                    }
                }

                $perfil->save();

                $perfil->categorias()->sync(
                    Categoria::whereIn(
                        'nome',
                        $dados['categorias']
                    )->pluck('id')
                );

                if ($novo) {
                    $credenciais[] = [
                        $dados['name'],
                        $email,
                        $senhaTemporaria,
                    ];
                }
            }
        });

        $this->command?->info('Advogados cadastrados com sucesso.');

        if ($credenciais) {
            $this->command?->table(
                ['Nome', 'E-mail', 'Senha temporária'],
                $credenciais
            );
        }
    }
}
