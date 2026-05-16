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
                'nome' => 'Direito Civil',
                'descricao' => 'Atua em contratos, indenizações, obrigações e relações civis.',
            ],
            [
                'nome' => 'Direito Penal',
                'descricao' => 'Atua em crimes, investigações, defesa criminal e processos penais.',
            ],
            [
                'nome' => 'Direito Trabalhista',
                'descricao' => 'Atua em relações entre empregados e empregadores.',
            ],
            [
                'nome' => 'Direito Previdenciário',
                'descricao' => 'Atua em aposentadorias, benefícios e questões do INSS.',
            ],
            [
                'nome' => 'Direito Tributário',
                'descricao' => 'Atua em impostos, tributos e obrigações fiscais.',
            ],
            [
                'nome' => 'Direito Empresarial',
                'descricao' => 'Atua em empresas, contratos empresariais e sociedades.',
            ],
            [
                'nome' => 'Direito do Consumidor',
                'descricao' => 'Atua na defesa dos direitos do consumidor.',
            ],
            [
                'nome' => 'Direito de Família',
                'descricao' => 'Atua em divórcios, guarda, pensão e união estável.',
            ],
            [
                'nome' => 'Direito Sucessório (Herança e Inventário)',
                'descricao' => 'Atua em heranças, inventários e sucessões.',
            ],
            [
                'nome' => 'Direito Imobiliário',
                'descricao' => 'Atua em compra, venda, aluguel e regularização de imóveis.',
            ],
            [
                'nome' => 'Direito Administrativo',
                'descricao' => 'Atua em questões envolvendo administração pública.',
            ],
            [
                'nome' => 'Direito Constitucional',
                'descricao' => 'Atua na interpretação e aplicação da Constituição.',
            ],
            [
                'nome' => 'Direito Ambiental',
                'descricao' => 'Atua em questões ambientais e sustentabilidade.',
            ],
            [
                'nome' => 'Direito Digital',
                'descricao' => 'Atua em crimes virtuais, internet e proteção de dados.',
            ],
            [
                'nome' => 'Direito Eleitoral',
                'descricao' => 'Atua em campanhas, eleições e partidos políticos.',
            ],
            [
                'nome' => 'Direito Internacional',
                'descricao' => 'Atua em relações jurídicas internacionais.',
            ],
            [
                'nome' => 'Direito Bancário',
                'descricao' => 'Atua em contratos bancários e relações financeiras.',
            ],
            [
                'nome' => 'Direito Médico e da Saúde',
                'descricao' => 'Atua em planos de saúde, erro médico e saúde pública.',
            ],
            [
                'nome' => 'Direito Militar',
                'descricao' => 'Atua em questões jurídicas militares.',
            ],
            [
                'nome' => 'Direito Desportivo',
                'descricao' => 'Atua em contratos e relações esportivas.',
            ],
            [
                'nome' => 'Direito Agrário',
                'descricao' => 'Atua em propriedades rurais e atividades agrícolas.',
            ],
            [
                'nome' => 'Direito Marítimo',
                'descricao' => 'Atua em transporte marítimo e atividades navais.',
            ],
            [
                'nome' => 'Direito Aeronáutico',
                'descricao' => 'Atua em transporte aéreo e aviação.',
            ],
            [
                'nome' => 'Direito de Propriedade Intelectual',
                'descricao' => 'Atua em marcas, patentes e propriedade intelectual.',
            ],
            [
                'nome' => 'Direito Autoral',
                'descricao' => 'Atua na proteção de obras e direitos autorais.',
            ],
            [
                'nome' => 'Direito da Criança e do Adolescente',
                'descricao' => 'Atua na proteção dos direitos de menores.',
            ],
            [
                'nome' => 'Direito LGBT+',
                'descricao' => 'Atua na defesa de direitos da comunidade LGBT+.',
            ],
            [
                'nome' => 'Direito da Moda (Fashion Law)',
                'descricao' => 'Atua em contratos, marcas e propriedade intelectual da moda.',
            ],
            [
                'nome' => 'Direito de Energia',
                'descricao' => 'Atua em regulamentação e negócios do setor energético.',
            ],
            [
                'nome' => 'Direito Minerário',
                'descricao' => 'Atua em mineração e exploração mineral.',
            ],
            [
                'nome' => 'Direito Aduaneiro',
                'descricao' => 'Atua em importação, exportação e alfândega.',
            ],
            [
                'nome' => 'Direito Financeiro',
                'descricao' => 'Atua em orçamento público e finanças.',
            ],
            [
                'nome' => 'Direito Urbanístico',
                'descricao' => 'Atua em planejamento urbano e regularização.',
            ],
            [
                'nome' => 'Direito Cooperativo',
                'descricao' => 'Atua em cooperativas e associações.',
            ],
            [
                'nome' => 'Direito Educacional',
                'descricao' => 'Atua em relações jurídicas na educação.',
            ],
            [
                'nome' => 'Mediação e Arbitragem',
                'descricao' => 'Atua em resolução extrajudicial de conflitos.',
            ],
            [
                'nome' => 'Compliance e Governança Corporativa',
                'descricao' => 'Atua em conformidade legal e governança empresarial.',
            ],
            [
                'nome' => 'Proteção de Dados (LGPD)',
                'descricao' => 'Atua em privacidade e proteção de dados pessoais.',
            ],
            [
                'nome' => 'Direito Securitário (Seguros)',
                'descricao' => 'Atua em contratos e disputas de seguros.',
            ],
            [
                'nome' => 'Direito Condominial',
                'descricao' => 'Atua em relações e conflitos em condomínios.',
            ],
            [
                'nome' => 'Execução Penal',
                'descricao' => 'Atua em cumprimento de penas e direitos dos presos.',
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
