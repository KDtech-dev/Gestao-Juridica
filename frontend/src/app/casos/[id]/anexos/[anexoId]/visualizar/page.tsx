"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getCasoById } from "@/api/apiCasos";
import {
  getCasoAnexoDownloadUrl,
  getCasoAnexoVisualizarUrl,
} from "@/api/apiAnexos";

import { AnexoViewer } from "@/components/AnexoViewer";

export default function AnexoVisualizarPage() {
  const params = useParams<{
    id: string;
    anexoId: string;
  }>();

  const router = useRouter();

  const [nomeArquivo, setNomeArquivo] = useState("Anexo");
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarAnexo = async () => {
      try {
        setCarregando(true);

        const response = await getCasoById(params.id);

        if (!response) {
          router.replace("/404");
          return;
        }

        const caso = response;

        const anexo = caso.anexos?.find(
          (item) => item.id === params.anexoId
        );

        if (!anexo) {
          router.replace("/404");
          return;
        }

        setNomeArquivo(
          anexo.nome ?? "Anexo"
        );

        setArquivoUrl(
          getCasoAnexoVisualizarUrl(
            caso.id,
            anexo.id
          )
        );

        setDownloadUrl(
          getCasoAnexoDownloadUrl(
            caso.id,
            anexo.id
          )
        );
      } catch (error) {
        console.error(
          "Erro ao carregar anexo:",
          error
        );

        router.replace("/404");
      } finally {
        setCarregando(false);
      }
    };

    carregarAnexo();
  }, [params.id, params.anexoId, router]);

  if (carregando || !arquivoUrl || !downloadUrl) {
    return null;
  }

  return (
    <AnexoViewer
      nomeArquivo={nomeArquivo}
      url={arquivoUrl}
      downloadUrl={downloadUrl}
    />
  );
}