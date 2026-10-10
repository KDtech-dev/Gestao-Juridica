<?php

namespace Database\Seeders;

use App\Enums\StatusPublicacao;
use App\Models\Categoria;
use App\Models\Publicacao;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class PublicacaoSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureDefaultPublicationImage();

        if (Categoria::count() === 0) {
            $this->call(CategoriaSeeder::class);
        }

        $autorPadrao = User::query()->orderBy('name')->first();

        if (! $autorPadrao) {
            return;
        }

        $publicacoes = [
            [
                'titulo' => 'Como organizar documentos antes de contratar um advogado',
                'categoria' => 'Direito Civil',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Veja quais documentos ajudam a tornar a primeira análise jurídica mais rápida, objetiva e segura.',
                'conteudo' => "A organização prévia dos documentos permite que o advogado compreenda o histórico do problema com mais precisão.\n\nContratos, mensagens, comprovantes de pagamento, notificações e documentos pessoais devem ser reunidos em ordem cronológica sempre que possível.\n\nEsse cuidado reduz retrabalho, evita informações desencontradas e ajuda na definição da melhor estratégia para cada caso.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(18),
            ],
            [
                'titulo' => 'Revisão de contrato: quando vale a pena fazer',
                'categoria' => 'Direito Civil',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Cláusulas mal redigidas podem gerar cobranças indevidas, multas abusivas e obrigações difíceis de cumprir.',
                'conteudo' => "A revisão contratual é recomendada antes da assinatura e também quando surgem dúvidas sobre reajustes, multas, prazos ou responsabilidades.\n\nUm contrato equilibrado protege as partes, deixa obrigações claras e reduz o risco de litígios futuros.\n\nNos contratos já assinados, a análise jurídica pode identificar abusos, falhas formais ou alternativas de negociação.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(14),
            ],
            [
                'titulo' => 'Benefício previdenciário negado: próximos passos',
                'categoria' => 'Direito Previdenciário',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'O indeferimento pelo INSS não encerra necessariamente a discussão sobre o benefício.',
                'conteudo' => "Quando um benefício é negado, o primeiro passo é analisar o motivo informado na decisão administrativa.\n\nPode haver falha documental, erro na contagem de tempo, ausência de perícia adequada ou interpretação equivocada das regras aplicáveis.\n\nCom a documentação correta, é possível avaliar recurso administrativo ou medida judicial, conforme o caso.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(10),
            ],
            [
                'titulo' => 'Cuidados em acordos trabalhistas',
                'categoria' => 'Direito Trabalhista',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Acordos devem ser analisados com atenção para evitar renúncias indevidas ou obrigações mal definidas.',
                'conteudo' => "A negociação trabalhista pode ser uma solução eficiente, mas exige clareza sobre valores, prazos, verbas incluídas e forma de pagamento.\n\nTambém é importante verificar se o acordo contempla multas por descumprimento e se as obrigações estão descritas de maneira objetiva.\n\nA análise técnica ajuda a reduzir riscos e evita que o problema reapareça no futuro.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(7),
            ],
            [
                'titulo' => 'Empréstimo consignado e descontos indevidos',
                'categoria' => 'Direito Bancário',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Entenda sinais de irregularidade em contratos bancários e descontos automáticos.',
                'conteudo' => "Descontos desconhecidos, contratos não reconhecidos e taxas acima do informado merecem análise cuidadosa.\n\nO consumidor deve reunir extratos, contratos, comprovantes e protocolos de atendimento para viabilizar a apuração.\n\nDependendo do caso, pode ser possível pedir suspensão dos descontos, revisão contratual e restituição de valores.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(4),
            ],
            [
                'titulo' => 'Atuação preventiva para empresas',
                'categoria' => 'Consultoria Legislativa',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'A prevenção jurídica ajuda empresas a reduzirem riscos em contratos, rotinas internas e decisões estratégicas.',
                'conteudo' => "A consultoria preventiva identifica riscos antes que eles se transformem em litígios.\n\nContratos, políticas internas, comunicação com clientes e cumprimento de normas podem ser avaliados com foco em segurança jurídica.\n\nEssa atuação permite decisões mais conscientes e reduz custos com conflitos futuros.",
                'status' => StatusPublicacao::PUBLICADO->value,
                'publicado_em' => Carbon::now()->subDays(2),
            ],
            [
                'titulo' => 'Guia de documentos para inventário',
                'categoria' => 'Direito Civil',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Rascunho de checklist para orientar famílias na fase inicial do inventário.',
                'conteudo' => "Documento em elaboração para organizar certidões, documentos pessoais, bens, dívidas e informações dos herdeiros.\n\nO objetivo é facilitar a triagem inicial e identificar se o procedimento poderá seguir pela via extrajudicial.",
                'status' => StatusPublicacao::RASCUNHO->value,
                'publicado_em' => null,
            ],
            [
                'titulo' => 'Atualização sobre prazos administrativos',
                'categoria' => 'Direito Público',
                'autor' => 'Equipe Afonso Advocacia',
                'resumo' => 'Material interno arquivado após revisão editorial.',
                'conteudo' => "Publicação arquivada para manter histórico editorial e evitar exibição pública de conteúdo desatualizado.",
                'status' => StatusPublicacao::ARQUIVADO->value,
                'publicado_em' => null,
            ],
        ];

        foreach ($publicacoes as $dados) {
            $categoriaId = Categoria::where('nome', $dados['categoria'])->value('id');

            Publicacao::updateOrCreate(
                ['titulo' => $dados['titulo']],
                [
                    'user_id' => $autorPadrao->id,
                    'categoria_id' => $categoriaId,
                    'imagem_caminho' => 'publicacoes/default-publication.png',
                    'autor' => $dados['autor'],
                    'resumo' => $dados['resumo'],
                    'conteudo' => $dados['conteudo'],
                    'status' => $dados['status'],
                    'publicado_em' => $dados['publicado_em'],
                ]
            );
        }
    }

    private function ensureDefaultPublicationImage(): void
    {
        $targetPath = 'publicacoes/default-publication.png';

        if (Storage::disk('public')->exists($targetPath)) {
            return;
        }

        $sourcePath = database_path('seeders/assets/default-publication.png');

        if (file_exists($sourcePath)) {
            Storage::disk('public')->put($targetPath, file_get_contents($sourcePath));
        }
    }
}
