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

