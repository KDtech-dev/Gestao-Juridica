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
  "Direito Tributário",
  "Direito Empresarial",
  "Direito Trabalhista",
  "Direito Civil",
  "Direito Digital",
  "Direito Imobiliário",
  "Direito de Família",
  "Contratos",
];

export const teamLawyers: TeamLawyer[] = [
  {
    id: "elena-silva",
    name: "Dra. Elena Silva",
    role: "Sócia | Direito Tributário",
    description:
      "Atua em planejamento tributário, defesas fiscais e estruturação jurídica de operações empresariais.",
    specialties: ["Direito Tributário", "Direito Empresarial"],
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    oab: "OAB/MG 123.456",
  },
  {
    id: "roberto-alves",
    name: "Dr. Roberto Alves",
    role: "Sócio | Direito Trabalhista",
    description:
      "Conduz estratégias preventivas e contenciosas em relações de trabalho e negociações coletivas.",
    specialties: ["Direito Trabalhista", "Direito Empresarial"],
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    oab: "OAB/MG 98.765",
  },
  {
    id: "marcos-santos",
    name: "Dr. Marcos Santos",
    role: "Advogado | Direito Digital",
    description:
      "Focado em LGPD, contratos tecnológicos, segurança da informação e governança de dados.",
    specialties: ["Direito Digital", "Contratos"],
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    oab: "OAB/MG 87.321",
  },
  {
    id: "beatriz-moraes",
    name: "Dra. Beatriz Moraes",
    role: "Advogada | Direito Civil",
    description:
      "Atende disputas cíveis estratégicas, responsabilidade civil e negociações de alta complexidade.",
    specialties: ["Direito Civil", "Contratos"],
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    oab: "OAB/MG 76.214",
  },
  {
    id: "lucas-ferreira",
    name: "Dr. Lucas Ferreira",
    role: "Advogado | Imobiliário e Família",
    description:
      "Assessora operações imobiliárias, inventários, planejamento patrimonial e acordos familiares.",
    specialties: ["Direito Imobiliário", "Direito de Família", "Direito Civil"],
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    oab: "OAB/MG 65.908",
  },
];
