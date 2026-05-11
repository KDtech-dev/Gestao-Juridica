import AcompanhamentoView from "@/views/Acompanhamento";
import { cases, findCase } from "@/data/cases";

export function generateStaticParams() {
  return cases.map((item) => ({
    cliente: item.clientSlug,
    caso: item.caseSlug,
  }));
}

export default async function AcompanhamentoDetalhePage({
  params,
}: {
  params: Promise<{ cliente: string; caso: string }>;
}) {
  const { cliente, caso } = await params;
  const item = findCase(cliente, caso);

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
