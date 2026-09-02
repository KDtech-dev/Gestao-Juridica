export type TeamLawyer = {
  id: string;
  name: string;
  role: string;
  description: string;
  specialties: string[];
  image: string;
  oab: string;
};

export const teamSpecialties = [
  "Direito Público",
  "Direito Trabalhista",
  "Direito Cível",
  "Direito Previdenciário",
  "Direito Bancário",
  "Consultoria Legislativa",
];

export const teamLawyers: TeamLawyer[] = [
  {
    id: "manfrine-chaves-almeida",
    name: "Dr. Manfrine Chaves de Almeida",
    role: "Sócio Fundador | Advogado e Contador",
    description:
      "Especialista em Direito Público, Trabalhista e Cível. Atua na condução estratégica de demandas judiciais e consultivas, aliando conhecimento jurídico e contábil para oferecer soluções seguras e personalizadas.",
    specialties: ["Direito Público", "Direito Trabalhista", "Direito Cível"],
    image: "/images/team/manfrine.jpeg",
    oab: "OAB/MG 148.359",
  },
  {
    id: "carollaine-damasceno-barros",
    name: "Dra. Carollaine Damasceno Barros",
    role: "Advogada e Contadora",
    description:
      "Especialista em Direito Público e Cível, com atuação em assessoria jurídica legislativa e consultoria técnica. Desenvolve pareceres e análises voltadas à gestão pública e ao controle de legalidade.",
    specialties: [
      "Direito Público",
      "Direito Cível",
      "Consultoria Legislativa",
    ],
    image: "/images/team/carollaine.jpeg",
    oab: "OAB/MG 213.235",
  },
  {
    id: "luiz-fernando-novais-neves",
    name: "Dr. Luiz Fernando Novais Neves",
    role: "Advogado",
    description:
      "Atua na área de Direito Previdenciário, dedicando-se à defesa dos direitos dos segurados e à obtenção de benefícios junto ao INSS, tanto na esfera administrativa quanto judicial.",
    specialties: ["Direito Previdenciário"],
    image: "/images/team/luiz-fernando.jpg",
    oab: "OAB/MG",
  },
  {
    id: "anderson-fazendeiro",
    name: "Dr. Anderson Fazendeiro",
    role: "Advogado",
    description:
      "Especialista em Direito Público, com experiência em demandas administrativas e judiciais envolvendo órgãos públicos, oferecendo assessoria estratégica e segurança jurídica.",
    specialties: ["Direito Público"],
    image: "/images/team/anderson.jpg",
    oab: "OAB/MG",
  },
  {
    id: "saiara-tavares-almeida",
    name: "Dra. Saiara Tavares Almeida",
    role: "Advogada",
    description:
      "Especialista em Direito Público e Previdenciário. Atua na defesa dos direitos sociais e administrativos, prestando atendimento personalizado e focado na melhor solução para cada cliente.",
    specialties: ["Direito Público", "Direito Previdenciário"],
    image: "/images/team/saiara.jpg",
    oab: "OAB/MG",
  },
  {
    id: "andressa-fazendeiro",
    name: "Dra. Andressa Fazendeiro",
    role: "Advogada",
    description:
      "Especialista em Direito Público e Bancário. Atua em demandas contratuais, financeiras e bancárias, oferecendo soluções jurídicas estratégicas para pessoas físicas, empresas e instituições.",
    specialties: ["Direito Público", "Direito Bancário"],
    image: "/images/team/andressa.jpeg",
    oab: "OAB/MG 232.143",
  },
  {
    id: "abraao-lincoln-prates-almeida",
    name: "Dr. Abraão Lincoln Prates de Almeida",
    role: "Advogado",
    description:
      "Atua nas áreas Trabalhista e Previdenciária, defendendo os direitos dos trabalhadores e segurados, com experiência em ações judiciais e processos administrativos perante o INSS.",
    specialties: ["Direito Trabalhista", "Direito Previdenciário"],
    image: "/images/team/abraao.jpeg",
    oab: "OAB/MG 248.337",
  },
];
