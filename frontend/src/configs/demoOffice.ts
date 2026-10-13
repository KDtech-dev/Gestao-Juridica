const configuredDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

export const demoOffice = {
  name: "Almeida & Costa Advocacia",
  shortName: "AC Advocacia",
  productName: "Gestão Jurídica",
  email: "contato@almeidacosta.example",
  phone: "(11) 90000-0000",
  address: {
    street: "Avenida Exemplo, 1000",
    district: "Centro",
    city: "São Paulo",
    state: "SP",
  },
  description:
    "Almeida & Costa Advocacia é um escritório fictício criado para demonstrar as funcionalidades da plataforma Gestão Jurídica, oferecendo uma experiência de navegação e gestão jurídica em ambiente de demonstração.",
  logo: "/images/demo-office.svg",
  colors: {
    primary: "#0f172a",
    secondary: "#334155",
    accent: "#cba765",
  },
  socialLinks: [] as const,
  team: [
    {
      id: "00000000-0000-4000-8000-000000000902",
      name: "Beatriz Nogueira",
      role: "Advogada demonstrativa",
      avatar: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000903",
      name: "Thiago Amaral",
      role: "Advogado demonstrativo",
      avatar: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000904",
      name: "Camila Ferraz",
      role: "Advogada demonstrativa",
      avatar: null,
    },
  ],
  demoMode:
    configuredDemoMode === undefined ||
    configuredDemoMode.trim().toLowerCase() === "true",
} as const;

export const demoModeEnabled = demoOffice.demoMode;
