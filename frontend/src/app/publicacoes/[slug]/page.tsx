import PublicationDetailView from "@/views/Publicacoes/PublicationDetail";
import {
  getPublicacaoPublicaBySlug,
  getPublicacoesPublicas,
} from "@/api/apiPublicacoes";
import { notFound } from "next/navigation";

import { slugifyPublicacao } from "@/@core/format";

export async function generateStaticParams() {
  const response = await getPublicacoesPublicas();
  return response.data.map((item) => ({
    slug: slugifyPublicacao(item.titulo ?? "publicacao", item.id),
  }));
}

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const response = await getPublicacaoPublicaBySlug(slug);
  console.log("anexos:", JSON.stringify(response?.data?.anexos));

  if (!response) {
    notFound();
  }

  return <PublicationDetailView publicacao={response.data} />;
}
