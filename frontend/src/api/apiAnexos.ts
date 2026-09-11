const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && process.env.NODE_ENV === "development") {
  console.error(
    "NEXT_PUBLIC_API_URL não definida — verifique .env.local e reinicie o servidor."
  );
}

export function getAnexoVisualizarUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}`;
}

export function getAnexoDownloadUrl(postId: string, anexoId: string) {
  return `${API_URL}/api/posts/${postId}/anexos/${anexoId}/download`;
}