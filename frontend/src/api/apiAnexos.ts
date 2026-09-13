const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function getAnexoVisualizarUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}`;
}

export function getAnexoDownloadUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}/download`;
}
