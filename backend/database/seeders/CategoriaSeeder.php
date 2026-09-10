<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nome' => 'Direito Público',
                'descricao' => 'Atua em questões que envolvem o Estado e o interesse coletivo, abrangendo relações entre o poder público e os cidadãos.',
            ],
            [
                'nome' => 'Direito Previdenciário',
                'descricao' => 'Atua em aposentadorias, benefícios e questões do INSS.',
            ],
            [
                'nome' => 'Direito Trabalhista',
                'descricao' => 'Atua em relações entre empregados e empregadores.',
            ],
            [
                'nome' => 'Direito Civil',
                'descricao' => 'Atua em contratos, indenizações, obrigações e relações civis.',
            ],
            [
                'nome' => 'Direito Bancário',
                'descricao' => 'Atua em contratos bancários e relações financeiras.',
            ],
            [
                'nome' => 'Consultoria Legislativa',
                'descricao' => 'Atua na elaboração, análise e acompanhamento de projetos de lei e normas.',
            ],
        ];

        foreach ($categorias as $categoria) {
            Categoria::firstOrCreate(
                ['nome' => $categoria['nome']],
                ['descricao' => $categoria['descricao']]
            );
        }
    }
}