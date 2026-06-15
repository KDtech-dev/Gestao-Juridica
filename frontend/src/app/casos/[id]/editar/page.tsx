import CasoFormView from "@/views/Casos/CasoFormView";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarCasoPage({ params }: Props) {
  const { id } = await params;
  console.log("CasoFormView renderizou:", { mode: "edit", casoId: id });
  return <CasoFormView mode="edit" casoId={id} />;
}
