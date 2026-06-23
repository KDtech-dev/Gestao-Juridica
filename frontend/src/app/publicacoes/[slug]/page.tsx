import PublicationDetailView from "@/views/Publicacoes/PublicationDetail";
import {
  getPublicacaoPublicaBySlug,
  getPublicacoesPublicas,
} from "@/api/apiPublicacoes";
import { notFound } from "next/navigation";

import { slugifyPublicacao } from "@/@core/format";

export async function generateStaticParams() {
  const publicacoes = await getPublicacoesPublicas();
  return publicacoes.map((item) => ({
    slug: slugifyPublicacao(item.titulo ?? "publicacao", item.id),
  }));
}

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publicacao = await getPublicacaoPublicaBySlug(slug);

  if (!publicacao) {
    notFound();
  }

  return <PublicationDetailView publicacao={publicacao} />;
}
