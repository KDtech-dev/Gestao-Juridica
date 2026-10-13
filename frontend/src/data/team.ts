export type TeamLawyer = {
  id: string;
  name: string;
  role: string;
  description: string;
  specialties: string[];
  image: string | null;
};

export const teamSpecialties = [
  "Direito Empresarial",
  "Direito Tributário",
  "Direito Cível",
  "Direito Trabalhista",
  "Direito de Família",
];

export const teamLawyers: TeamLawyer[] = [
  {
    id: "beatriz-nogueira-demo",
    name: "Beatriz Nogueira",
    role: "Advogada demonstrativa",
    description:
      "Perfil fictício para demonstrar recursos de gestão de equipe e atendimento empresarial.",
    specialties: ["Direito Empresarial", "Direito Tributário"],
    image: null,
  },
  {
    id: "thiago-amaral-demo",
    name: "Thiago Amaral",
    role: "Advogado demonstrativo",
    description:
      "Perfil fictício para apresentar recursos de organização e prevenção de conflitos trabalhistas.",
    specialties: ["Direito Empresarial", "Direito Trabalhista"],
    image: null,
  },
  {
    id: "camila-ferraz-demo",
    name: "Camila Ferraz",
    role: "Advogada demonstrativa",
    description:
      "Perfil fictício usado para apresentar recursos de atendimento em demandas cíveis e familiares.",
    specialties: ["Direito Cível", "Direito de Família"],
    image: null,
  },
];
