import { getAxios } from "@/configs/axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// PUBLICAÇÕES

export function getAnexoVisualizarUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}`;
}

export function getAnexoDownloadUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}/download`;
}

// CASOS

export function getCasoAnexoVisualizarUrl(
  casoId: string,
  anexoId: string
) {
  return `${API_URL}/api/casos/${casoId}/anexos/${anexoId}`;
}

export function getCasoAnexoDownloadUrl(
  casoId: string,
  anexoId: string
) {
  return `${API_URL}/api/casos/${casoId}/anexos/${anexoId}/download`;
}

export async function downloadAnexo(url: string, nomeArquivo: string) {
  const response = await getAxios().get<Blob>(url, {
    baseURL: "",
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
