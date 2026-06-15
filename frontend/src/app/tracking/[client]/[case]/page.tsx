import AcompanhamentoView from "@/views/Casos/Acompanhamento";
import { cases, findCase } from "@/data/cases";

export function generateStaticParams() {
  return cases.map((item) => ({
    client: item.clientSlug,
    case: item.caseSlug,
  }));
}

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ client: string; case: string }>;
}) {
  const { client, case: caseSlug } = await params;
  const item = findCase(client, caseSlug);

  if (!item) {
    return (
      <AcompanhamentoView
        clientName="Cliente"
        caseTitle="Caso não encontrado"
        processNumber="-"
        status="Pendente"
        nextHearing="-"
        lawyerName="-"
      />
    );
  }

  return (
    <AcompanhamentoView
      clientName={item.clientName}
      caseTitle={item.caseTitle}
      processNumber={item.processNumber}
      status={item.status}
      nextHearing={item.nextHearing}
      lawyerName={item.lawyerName}
    />
  );
}
