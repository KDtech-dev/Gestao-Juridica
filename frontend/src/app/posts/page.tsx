import PublicacoesRouteView from "@/views/PublicacoesRoute";
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";
import { demoModeEnabled } from "@/configs/demoOffice";
import { getDemoPublicData } from "@/data/publicDemo";
import { getRequestLocale } from "@/services/requestLocale";

export default async function PostsPage() {
  if (demoModeEnabled) {
    return (
      <PublicacoesRouteView
        publicacoesPublicas={getDemoPublicData(await getRequestLocale()).demoPublicacoes}
      />
    );
  }

  const response = await getPublicacoesPublicas();
  return <PublicacoesRouteView publicacoesPublicas={response.data} />;
}
