import PublicationDetailView from "@/views/PublicationDetail";
import { findPublicacaoBySlug, publicacoes } from "@/data/publicacoes";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return publicacoes.map((item) => ({ slug: item.slug }));
}

export default async function PublicacaoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publicacao = findPublicacaoBySlug(slug);

  if (!publicacao) {
    notFound();
  }

  return <PublicationDetailView publicacao={publicacao} />;
}
