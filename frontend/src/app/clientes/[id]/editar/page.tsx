import ClienteFormView from "@/views/Clientes/ClienteFormView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  return <ClienteFormView mode="edit" clienteId={id} />;
}