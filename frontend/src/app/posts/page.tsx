import PublicacoesRouteView from "@/views/PublicacoesRoute";
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";

export default async function PostsPage() {
  const response = await getPublicacoesPublicas();
  return <PublicacoesRouteView publicacoesPublicas={response.data} />;
}
