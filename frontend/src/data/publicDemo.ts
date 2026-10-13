import type {
  AdvogadoPublicoType,
  CategoriaType,
  PublicacaoType,
} from "@/@core/types";
import { demoOffice } from "@/configs/demoOffice";

export type DemoLocale = "pt" | "en" | "es";

const categories = {
  pt: ["Direito Empresarial", "Direito Tributário", "Direito Cível", "Direito Trabalhista", "Direito de Família"],
  en: ["Business Law", "Tax Law", "Civil Law", "Labor Law", "Family Law"],
  es: ["Derecho Empresarial", "Derecho Tributario", "Derecho Civil", "Derecho Laboral", "Derecho de Familia"],
} satisfies Record<DemoLocale, string[]>;

const copy = {
  pt: {
    bios: [
      "Atuação consultiva para empresas em contratos, organização societária e planejamento tributário.",
      "Atuação dedicada à prevenção de conflitos trabalhistas e à assessoria jurídica de negócios.",
      "Atendimento próximo em demandas cíveis, familiares e soluções consensuais de conflitos.",
    ],
    posts: [
      ["Planejamento tributário para pequenas empresas", "Práticas para organizar obrigações fiscais e tomar decisões empresariais com mais previsibilidade.", "Um planejamento tributário estruturado ajuda empresas a compreender suas obrigações, avaliar cenários e tomar decisões sustentáveis. Cada estratégia deve considerar a atividade e a realidade do negócio."],
      ["Contratos de serviço com mais clareza", "Escopo, prazos e responsabilidades ajudam a organizar as relações comerciais.", "Contratos claros alinham expectativas. A descrição do serviço, os prazos, a forma de pagamento, as responsabilidades e as regras de encerramento merecem atenção durante a elaboração."],
      ["Acordos familiares e diálogo", "A mediação pode apoiar conversas delicadas e decisões duradouras.", "Em questões familiares, informação e diálogo ajudam a construir soluções mais seguras. A mediação pode ser uma alternativa para organizar decisões, considerando as particularidades de cada caso."],
      ["Boas práticas nas relações de trabalho", "Documentação e comunicação ajudam a tornar as rotinas mais transparentes.", "Políticas internas compreensíveis e registros organizados dão clareza às relações de trabalho. A prevenção começa com orientação adequada e processos consistentes."],
    ],
  },
  en: {
    bios: [
      "Business counsel focused on contracts, company organization, and tax planning.",
      "Focused on preventing workplace disputes and advising businesses.",
      "Practical support for civil and family matters, including consensual dispute resolution.",
    ],
    posts: [
      ["Tax planning for small businesses", "Ways to organize tax obligations and make business decisions with greater predictability.", "A structured tax plan helps businesses understand their obligations, assess scenarios, and make sustainable decisions. Each approach should reflect the company’s activity and circumstances."],
      ["Clearer service agreements", "Scope, timelines, and responsibilities help organize commercial relationships.", "Clear agreements align expectations. Service descriptions, timelines, payment terms, responsibilities, and termination rules deserve attention during drafting."],
      ["Family agreements and dialogue", "Mediation can support difficult conversations and lasting decisions.", "In family matters, information and dialogue help build safer solutions. Mediation may help organize decisions while taking each situation into account."],
      ["Good practices in workplace relations", "Documentation and communication can make daily work more transparent.", "Understandable internal policies and organized records bring clarity to workplace relations. Prevention starts with suitable guidance and consistent processes."],
    ],
  },
  es: {
    bios: [
      "Asesoría empresarial en contratos, organización societaria y planificación tributaria.",
      "Enfoque en la prevención de conflictos laborales y la asesoría jurídica a empresas.",
      "Atención práctica en asuntos civiles y familiares y en soluciones consensuadas.",
    ],
    posts: [
      ["Planificación tributaria para pequeñas empresas", "Prácticas para organizar obligaciones fiscales y decidir con mayor previsibilidad.", "Una planificación tributaria estructurada ayuda a las empresas a comprender sus obligaciones, evaluar escenarios y tomar decisiones sostenibles. Cada estrategia debe considerar la actividad y la realidad del negocio."],
      ["Contratos de servicios más claros", "Alcance, plazos y responsabilidades ayudan a organizar relaciones comerciales.", "Los contratos claros alinean expectativas. La descripción del servicio, los plazos, la forma de pago, las responsabilidades y las reglas de finalización merecen atención durante su elaboración."],
      ["Acuerdos familiares y diálogo", "La mediación puede apoyar conversaciones delicadas y decisiones duraderas.", "En asuntos familiares, la información y el diálogo ayudan a construir soluciones más seguras. La mediación puede ayudar a organizar decisiones según cada situación."],
      ["Buenas prácticas en las relaciones laborales", "La documentación y la comunicación ayudan a hacer más transparentes las rutinas.", "Las políticas internas comprensibles y los registros organizados aportan claridad a las relaciones laborales. La prevención comienza con orientación adecuada y procesos coherentes."],
    ],
  },
} satisfies Record<DemoLocale, { bios: string[]; posts: [string, string, string][] }>;

export function getDemoPublicData(locale: DemoLocale = "pt"): {
  demoCategorias: CategoriaType[];
  demoAdvogados: AdvogadoPublicoType[];
  demoPublicacoes: PublicacaoType[];
} {
  const categoryNames = categories[locale];
  const demoCategorias = categoryNames.map((nome, index) => ({
    id: 901 + index,
    nome,
  }));

  const demoAdvogados = demoOffice.team.map((person, index) => ({
    uuid: person.id,
    name: person.name,
    foto_perfil_url: person.avatar,
    oab_numero: "",
    oab_uf: "",
    resumo_pessoal: copy[locale].bios[index],
    categorias:
      index === 0
        ? [categoryNames[0], categoryNames[1]]
        : index === 1
          ? [categoryNames[0], categoryNames[3]]
          : [categoryNames[2], categoryNames[4]],
  }));

  const demoPublicacoes = copy[locale].posts.map(
    ([titulo, resumo, conteudo], index) => {
      const date = ["2026-10-08", "2026-10-03", "2026-09-27", "2026-09-19"][
        index
      ] + "T12:00:00.000Z";
      return {
        id: "00000000-0000-4000-8000-00000000091" + (index + 1),
        titulo,
        resumo,
        conteudo,
        imagem_caminho: null,
        imagem_url: [
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85",
          "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85",
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
          "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85",
        ][index],
        autor: demoOffice.team[index === 2 ? 2 : index === 1 ? 1 : 0].name,
        status: "publicado" as const,
        publicado_em: date,
        created_at: date,
        updated_at: date,
        categoria_id: 901 + (index % categoryNames.length),
        categoria: demoCategorias[index % categoryNames.length],
        user: null,
        anexos: [],
      };
    },
  );

  return { demoCategorias, demoAdvogados, demoPublicacoes };
}
