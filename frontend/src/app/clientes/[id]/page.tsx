import ClienteFormView from "@/views/Clientes/ClienteFormView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VisualizarClientePage({ params }: Props) {
  const { id } = await params;
  return <ClienteFormView mode="view" clienteId={id} />;
}