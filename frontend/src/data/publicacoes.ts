export type PublicacaoAnexo = {
  id: string;
  nome: string;
  url: string;
};

export type PublicacaoItem = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  bannerImage: string;
  conteudoHtml: string;
  tipo: "Atualização de Caso" | "Comunicado ao Cliente" | "Notícia Jurídica";
  categoria: string;
  autor: string;
  authorEmail?: string;
  data: string;
  readTime: string;
  cliente: string;
  processo: string;
  anexos: PublicacaoAnexo[];
};

export const publicacoes: PublicacaoItem[] = [
  {
    id: "p1",
    slug: "reforma-tributaria-impactos-2026",
    titulo: "Reforma Tributária: impactos práticos para empresas em 2026",
    resumo:
      "Entenda como as mudanças afetam contratos, fluxo de caixa e planejamento fiscal do seu negócio.",
    bannerImage:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1400&q=80",
    conteudoHtml:
      "<p>A reforma tributária traz novos cenários para empresas de médio e grande porte, exigindo revisão de contratos, políticas internas e estratégias de compliance.</p><p>No curto prazo, é fundamental mapear riscos operacionais e adequar cláusulas que tratam de repasse de custos e equilíbrio econômico-financeiro.</p><p>Também recomendamos revisar políticas de faturamento e rotina de auditoria fiscal para mitigar passivos.</p>",
    tipo: "Notícia Jurídica",
    categoria: "Tributário",
    autor: "Dra. Elena Silva",
    authorEmail: "teste@email.com",
    data: "29 Mar 2026",
    readTime: "6 min",
    cliente: "Acme Corporation",
    processo: "0000000-00.0000.0.00.0000",
    anexos: [
      {
        id: "a1",
        nome: "Resumo Executivo.pdf",
        url: "/docs/resumo-executivo.pdf",
      },
      {
        id: "a2",
        nome: "Checklist Fiscal.xlsx",
        url: "/docs/checklist-fiscal.xlsx",
      },
    ],
  },
  {
    id: "p2",
    slug: "clausulas-criticas-contratos-b2b",
    titulo: "Cláusulas críticas em contratos B2B que reduzem risco jurídico",
    resumo:
      "Checklist objetivo para fortalecer segurança contratual e diminuir passivos em operações recorrentes.",
    bannerImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
    conteudoHtml:
      "<p>Contratos B2B bem estruturados reduzem disputas e melhoram previsibilidade financeira.</p><p>As cláusulas de limitação de responsabilidade, SLA e confidencialidade devem ser revisadas de forma integrada ao modelo de negócio.</p>",
    tipo: "Comunicado ao Cliente",
    categoria: "Contratos",
    autor: "Dr. Roberto Alves",
    authorEmail: "advogado@example.com",
    data: "27 Mar 2026",
    readTime: "5 min",
    cliente: "TechStart Inc.",
    processo: "9988776-44.2025.8.26.0002",
    anexos: [
      {
        id: "a3",
        nome: "Modelo-Contrato-B2B.docx",
        url: "/docs/modelo-b2b.docx",
      },
    ],
  },
  {
    id: "p3",
    slug: "compliance-politicas-que-funcionam",
    titulo: "Compliance interno: como estruturar políticas que funcionam",
    resumo:
      "Boas práticas para adoção de políticas internas, auditoria de processos e treinamento de equipes.",
    bannerImage:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    conteudoHtml:
      "<p>Programas de compliance eficientes combinam governança, treinamento recorrente e trilha de evidências.</p><p>A definição clara de papéis e indicadores ajuda na execução e no monitoramento contínuo.</p>",
    tipo: "Atualização de Caso",
    categoria: "Compliance",
    autor: "Dra. Ana Costa",
    authorEmail: "advogado@example.com",
    data: "25 Mar 2026",
    readTime: "7 min",
    cliente: "Maria Oliveira",
    processo: "1234567-11.2025.8.26.0001",
    anexos: [],
  },
  {
    id: "p4",
    slug: "lgpd-gestao-de-riscos-em-contratos",
    titulo: "LGPD: gestão de riscos em contratos com fornecedores",
    resumo:
      "Pontos de atenção para cláusulas de proteção de dados, auditoria e responsabilidade compartilhada.",
    bannerImage:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80",
    conteudoHtml:
      "<p>Contratos com fornecedores que tratam dados pessoais precisam delimitar responsabilidades, bases legais e procedimentos de resposta a incidentes.</p><p>Também é recomendável prever auditorias, padrões mínimos de segurança e evidências de conformidade.</p>",
    tipo: "Notícia Jurídica",
    categoria: "LGPD",
    autor: "Dr. Marcos Santos",
    authorEmail: "funcionario@example.com",
    data: "22 Mar 2026",
    readTime: "6 min",
    cliente: "DataPrime Ltda.",
    processo: "4567890-22.2025.8.26.0100",
    anexos: [
      {
        id: "a4",
        nome: "Checklist-LGPD.pdf",
        url: "/docs/checklist-lgpd.pdf",
      },
    ],
  },
  {
    id: "p5",
    slug: "recuperacao-de-creditos-estrategias",
    titulo: "Recuperação de créditos: estratégias para reduzir inadimplência",
    resumo:
      "Como combinar negociação, garantias contratuais e medidas judiciais para preservar caixa.",
    bannerImage:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1400&q=80",
    conteudoHtml:
      "<p>A recuperação de créditos eficiente começa pela análise documental e pela classificação do risco de cada devedor.</p><p>Medidas extrajudiciais bem conduzidas podem preservar relacionamento comercial, enquanto garantias e ações judiciais devem ser usadas com estratégia.</p>",
    tipo: "Comunicado ao Cliente",
    categoria: "Empresarial",
    autor: "Dra. Elena Silva",
    authorEmail: "teste@email.com",
    data: "20 Mar 2026",
    readTime: "5 min",
    cliente: "Grupo Horizonte",
    processo: "7654321-33.2025.8.26.0003",
    anexos: [],
  },
];

export function findPublicacaoBySlug(slug: string) {
  return publicacoes.find((item) => item.slug === slug);
}
