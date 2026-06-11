import ClienteDetalhesView from "@/views/ClienteDetalhes";

export default async function ClienteDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ClienteDetalhesView clienteId={id} />;
}
