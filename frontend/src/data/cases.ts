export type CaseItem = {
  clientSlug: string;
  clientName: string;
  caseSlug: string;
  caseTitle: string;
  processNumber: string;
  status: "Em Andamento" | "Pendente" | "Concluído";
  nextHearing: string;
  lawyerName: string;
};

export type ClientStatus = "Ativo" | "Inativo" | "Prospecto";

export type ClientItem = {
  slug: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  status: ClientStatus;
};

export const clients: ClientItem[] = [
  {
    slug: "acme-corporation",
    name: "Acme Corporation",
    contactName: "João Silva",
    email: "juridico@acmecorp.com.br",
    phone: "+55 11 98765-4321",
    cpfCnpj: "12.345.678/0001-90",
    status: "Ativo",
  },
  {
    slug: "maria-oliveira",
    name: "Maria Oliveira",
    contactName: "-",
    email: "maria.oliveira@email.com",
    phone: "+55 11 99999-8888",
    cpfCnpj: "123.456.789-00",
    status: "Ativo",
  },
  {
    slug: "techstart-inc",
    name: "TechStart Inc.",
    contactName: "Sarah Santos",
    email: "sarah@techstart.io",
    phone: "+55 41 95555-0198",
    cpfCnpj: "98.765.432/0001-10",
    status: "Inativo",
  },
  {
    slug: "joao-santos-silva",
    name: "João Santos Silva",
    contactName: "João Santos",
    email: "joao.santos@email.com",
    phone: "+55 21 98888-7777",
    cpfCnpj: "234.567.890-11",
    status: "Ativo",
  },
  {
    slug: "global-logistics-llc",
    name: "Global Logistics LLC",
    contactName: "Roberto Chen",
    email: "legal@globallogistics.com.br",
    phone: "+55 21 95555-0123",
    cpfCnpj: "45.678.901/0001-23",
    status: "Ativo",
  },
  {
    slug: "ana-paula-costa",
    name: "Ana Paula Costa",
    contactName: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "+55 31 97777-6666",
    cpfCnpj: "345.678.901-22",
    status: "Prospecto",
  },
  {
    slug: "cliente",
    name: "Cliente",
    contactName: "Portal",
    email: "cliente@email.com",
    phone: "+55 11 90000-0000",
    cpfCnpj: "000.000.000-00",
    status: "Ativo",
  },
];

export const cases: CaseItem[] = [
  {
    clientSlug: "acme-corporation",
    clientName: "Acme Corporation",
    caseSlug: "acao-trabalhista-empresa-x",
    caseTitle: "Ação Trabalhista - Empresa X",
    processNumber: "0000000-00.0000.0.00.0000",
    status: "Em Andamento",
    nextHearing: "08/04/2026 - 14:30",
    lawyerName: "Dra. Elena Silva",
  },
  {
    clientSlug: "maria-oliveira",
    clientName: "Maria Oliveira",
    caseSlug: "revisao-contratual-locacao",
    caseTitle: "Revisão Contratual de Locação",
    processNumber: "1234567-11.2025.8.26.0001",
    status: "Em Andamento",
    nextHearing: "12/04/2026 - 10:00",
    lawyerName: "Dra. Elena Silva",
  },
  {
    clientSlug: "techstart-inc",
    clientName: "TechStart Inc",
    caseSlug: "acordo-comercial-saas",
    caseTitle: "Acordo Comercial SaaS",
    processNumber: "9988776-44.2025.8.26.0002",
    status: "Pendente",
    nextHearing: "Sem audiência definida",
    lawyerName: "Dra. Elena Silva",
  },
  {
    clientSlug: "cliente",
    clientName: "Cliente",
    caseSlug: "processo-principal",
    caseTitle: "Processo Principal",
    processNumber: "1111111-22.2025.8.26.0003",
    status: "Em Andamento",
    nextHearing: "15/04/2026 - 16:00",
    lawyerName: "Dra. Elena Silva",
  },
  {
    clientSlug: "cliente",
    clientName: "Cliente",
    caseSlug: "recurso-tributario",
    caseTitle: "Recurso Tributário",
    processNumber: "2222222-33.2025.8.26.0004",
    status: "Pendente",
    nextHearing: "Aguardando despacho",
    lawyerName: "Dra. Elena Silva",
  },
];

export function findCase(clientSlug: string, caseSlug: string) {
  return cases.find(
    (item) => item.clientSlug === clientSlug && item.caseSlug === caseSlug,
  );
}

export function firstCaseByClient(clientSlug: string) {
  return cases.find((item) => item.clientSlug === clientSlug);
}

export function listCasesByClient(clientSlug: string) {
  return cases.filter((item) => item.clientSlug === clientSlug);
}

export function listTrackedClients() {
  return clients.filter((client) =>
    cases.some((item) => item.clientSlug === client.slug),
  );
}
