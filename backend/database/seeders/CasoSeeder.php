<?php

namespace Database\Seeders;

use App\Models\Caso;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;

class CasoSeeder extends Seeder
{
    public function run(): void
    {
        $advogados = User::whereHas('roles', fn ($query) => $query->where('name', 'advogado'))
            ->orderBy('name')
            ->get();

        $casos = [
            ['cliente_cpf_cnpj' => '12345678901', 'numero_processo' => '1000123-45.2026.8.13.0001', 'titulo' => 'Revisao de contrato de locacao residencial', 'descricao' => 'Analise de reajustes, garantias e clausulas de rescisao em contrato residencial.', 'status' => 'aberto', 'data_abertura' => '2026-01-12', 'data_encerramento' => null, 'papel' => 'locataria', 'categorias' => ['Direito Civil'], 'advogado_index' => 0],
            ['cliente_cpf_cnpj' => '12345678901', 'numero_processo' => '1000456-72.2026.8.13.0001', 'titulo' => 'Indenizacao por danos materiais', 'descricao' => 'Pedido de reparacao por prejuizos causados por obra em imovel vizinho.', 'status' => 'em_andamento', 'data_abertura' => '2026-02-03', 'data_encerramento' => null, 'papel' => 'autora', 'categorias' => ['Direito Civil'], 'advogado_index' => 1],
            ['cliente_cpf_cnpj' => '11222333000181', 'numero_processo' => '1000789-24.2026.5.03.0012', 'titulo' => 'Defesa em reclamacao trabalhista coletiva', 'descricao' => 'Contestacao de pedidos relacionados a horas extras, adicionais e verbas rescisorias.', 'status' => 'em_andamento', 'data_abertura' => '2026-02-20', 'data_encerramento' => null, 'papel' => 'reclamada', 'categorias' => ['Direito Trabalhista'], 'advogado_index' => 2],
            ['cliente_cpf_cnpj' => '11222333000181', 'numero_processo' => '1000810-97.2026.8.13.0024', 'titulo' => 'Analise de contrato administrativo', 'descricao' => 'Revisao preventiva de obrigações, prazos e riscos em contrato com municipio.', 'status' => 'aberto', 'data_abertura' => '2026-03-01', 'data_encerramento' => null, 'papel' => 'contratada', 'categorias' => ['Direito Público', 'Consultoria Legislativa'], 'advogado_index' => 0],
            ['cliente_cpf_cnpj' => '23456789012', 'numero_processo' => '1001022-36.2026.8.26.0100', 'titulo' => 'Revisao de emprestimo consignado', 'descricao' => 'Apuracao de descontos, taxa efetiva e possivel abusividade em contrato bancario.', 'status' => 'aberto', 'data_abertura' => '2026-03-14', 'data_encerramento' => null, 'papel' => 'autor', 'categorias' => ['Direito Bancário'], 'advogado_index' => 1],
            ['cliente_cpf_cnpj' => '23456789012', 'numero_processo' => '1001345-41.2026.4.01.9199', 'titulo' => 'Aposentadoria por tempo de contribuicao', 'descricao' => 'Acompanhamento de pedido previdenciario com revisao de periodos especiais.', 'status' => 'em_andamento', 'data_abertura' => '2026-04-05', 'data_encerramento' => null, 'papel' => 'segurado', 'categorias' => ['Direito Previdenciário'], 'advogado_index' => 2],
            ['cliente_cpf_cnpj' => '22333444000172', 'numero_processo' => '1001678-90.2026.8.19.0001', 'titulo' => 'Adequacao contratual com fornecedores', 'descricao' => 'Padronizacao de clausulas de pagamento, confidencialidade e responsabilidade civil.', 'status' => 'aberto', 'data_abertura' => '2026-04-18', 'data_encerramento' => null, 'papel' => 'contratante', 'categorias' => ['Direito Civil'], 'advogado_index' => 0],
            ['cliente_cpf_cnpj' => '22333444000172', 'numero_processo' => '1001901-43.2026.8.19.0001', 'titulo' => 'Defesa em auto de infracao sanitaria', 'descricao' => 'Impugnacao administrativa de penalidade aplicada por fiscalizacao sanitaria.', 'status' => 'em_andamento', 'data_abertura' => '2026-05-09', 'data_encerramento' => null, 'papel' => 'autuada', 'categorias' => ['Direito Público'], 'advogado_index' => 1],
            ['cliente_cpf_cnpj' => '34567890123', 'numero_processo' => '1002122-18.2026.8.07.0001', 'titulo' => 'Inventario extrajudicial familiar', 'descricao' => 'Organizacao documental e minuta de escritura para partilha consensual.', 'status' => 'aberto', 'data_abertura' => '2026-05-22', 'data_encerramento' => null, 'papel' => 'herdeira', 'categorias' => ['Direito Civil'], 'advogado_index' => 2],
            ['cliente_cpf_cnpj' => '34567890123', 'numero_processo' => '1002455-67.2026.4.01.3400', 'titulo' => 'Recurso administrativo previdenciario', 'descricao' => 'Recurso contra indeferimento de beneficio por incapacidade temporaria.', 'status' => 'encerrado', 'data_abertura' => '2026-06-02', 'data_encerramento' => '2026-08-16', 'papel' => 'recorrente', 'categorias' => ['Direito Previdenciário'], 'advogado_index' => 0],
        ];

        foreach ($casos as $dados) {
            $cliente = Cliente::where('cpf_cnpj', $dados['cliente_cpf_cnpj'])->first();
            if (! $cliente) continue;

            $advogado = $advogados->isNotEmpty() ? $advogados->get($dados['advogado_index'] % $advogados->count()) : null;

            $caso = Caso::withTrashed()->updateOrCreate(
                ['numero_processo' => $dados['numero_processo']],
                [
                    'titulo' => $dados['titulo'],
                    'descricao' => $dados['descricao'],
                    'status' => $dados['status'],
                    'data_abertura' => $dados['data_abertura'],
                    'data_encerramento' => $dados['data_encerramento'],
                    'advogado_id' => $advogado?->id,
                ]
            );

            if ($caso->trashed()) {
                $caso->restore();
            }

            $caso->clientes()->syncWithoutDetaching([
                $cliente->id => ['papel' => $dados['papel']],
            ]);

            $categoriaIds = Categoria::whereIn('nome', $dados['categorias'])->pluck('id')->all();
            $caso->categorias()->sync($categoriaIds);
        }
    }
}
