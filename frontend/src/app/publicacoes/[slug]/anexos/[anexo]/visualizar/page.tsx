import { notFound } from "next/navigation";
import {
  getPublicacaoPublicaBySlug,
} from "@/api/apiPublicacoes";
import {
  getAnexoDownloadUrl,
  getAnexoVisualizarUrl,
} from "@/api/apiAnexos";
import { AnexoViewer } from "@/components/AnexoViewer";

export default async function AnexoVisualizarPage({
  params,
}: {
  params: Promise<{
    slug: string;
    anexo: string;
  }>;
}) {
  const { slug, anexo } = await params;

  const response = await getPublicacaoPublicaBySlug(slug);

  if (!response?.data) {
    notFound();
  }

  const publicacao = response.data;

  const anexoEncontrado = publicacao.anexos.find(
    (item) => item.id === anexo
  );

  if (!anexoEncontrado) {
    notFound();
  }

  const arquivoUrl = getAnexoVisualizarUrl(
    publicacao.id,
    anexoEncontrado.id
  );

  const downloadUrl = getAnexoDownloadUrl(
    publicacao.id,
    anexoEncontrado.id
  );

  return (
    <AnexoViewer
      nomeArquivo={
        anexoEncontrado.nome_arquivo ?? "Anexo"
      }
      url={arquivoUrl}
      downloadUrl={downloadUrl}
    />
  );
}