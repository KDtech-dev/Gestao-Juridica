import PublicationDetailView from "@/views/Publicacoes/PublicationDetail";
import { getPublicacaoPublicaBySlug } from "@/api/apiPublicacoes";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const response = await getPublicacaoPublicaBySlug(slug);
  if (!response) {
    notFound();
  }

  return <PublicationDetailView publicacao={response.data} />;
}
