import CasoFormView from "@/views/Casos/CasoFormView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VisualizarCasoPage({ params }: Props) {
  const { id } = await params;

  return <CasoFormView mode="view" casoId={id} />;
}
