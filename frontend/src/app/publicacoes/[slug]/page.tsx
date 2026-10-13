import PublicationDetailView from "@/views/Publicacoes/PublicationDetail";
import { getPublicacaoPublicaBySlug } from "@/api/apiPublicacoes";
import { notFound } from "next/navigation";
import { demoModeEnabled } from "@/configs/demoOffice";
import { getDemoPublicData } from "@/data/publicDemo";
import { getRequestLocale } from "@/services/requestLocale";

export const dynamic = "force-dynamic";

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (demoModeEnabled) {
    const { demoPublicacoes } = getDemoPublicData(await getRequestLocale());
    const publicacao = demoPublicacoes.find((item) => slug.endsWith(item.id));
    if (!publicacao) notFound();
    return <PublicationDetailView publicacao={publicacao} />;
  }

  const response = await getPublicacaoPublicaBySlug(slug);
  if (!response) {
    notFound();
  }

  return <PublicationDetailView publicacao={response.data} />;
}
