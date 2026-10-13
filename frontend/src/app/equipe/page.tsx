import { getAdvogadosPublicos } from "@/api/ApiAdvogados";
import TeamView from "@/views/Team";
import { demoModeEnabled } from "@/configs/demoOffice";
import { getDemoPublicData } from "@/data/publicDemo";
import { getRequestLocale } from "@/services/requestLocale";

export default async function TeamPage() {
  if (demoModeEnabled) {
    return <TeamView advogados={getDemoPublicData(await getRequestLocale()).demoAdvogados} />;
  }

  const advogadosRes = await getAdvogadosPublicos();

  return <TeamView advogados={advogadosRes.data} />;
}
