import PublicacoesRouteView from "@/views/PublicacoesRoute";
import { getPublicacoesPublicas } from "@/api/publicacoes/apiPublicacoes";

export default async function PostsPage() {
  const publicacoesPublicas = await getPublicacoesPublicas();

  return <PublicacoesRouteView publicacoesPublicas={publicacoesPublicas} />;
}
