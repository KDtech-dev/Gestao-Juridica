import PublicacoesRouteView from "@/views/PublicacoesRoute";
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";

export default async function PostsPage() {
  const publicacoesPublicas = await getPublicacoesPublicas();

  return <PublicacoesRouteView publicacoesPublicas={publicacoesPublicas} />;
}
