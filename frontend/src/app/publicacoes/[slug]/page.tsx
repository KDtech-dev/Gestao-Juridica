import PublicationDetailView from "@/views/PublicationDetail";
import {
  getPublicacaoPublicaBySlug,
  getPublicacoesPublicas,
} from "@/api/publicacoes/apiPublicacoes";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const publicacoes = await getPublicacoesPublicas();

  return publicacoes.map((item) => ({ slug: item.slug }));
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
