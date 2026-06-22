import PublicacoesRouteView from "@/views/PublicacoesRoute";
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";

export default async function PublicacoesPage() {
  const publicacoesPublicas = await getPublicacoesPublicas();

  return <PublicacoesRouteView publicacoesPublicas={publicacoesPublicas} />;
}
