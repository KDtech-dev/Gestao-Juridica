import { getAdvogadosPublicos } from "@/api/ApiAdvogados";
import TeamView from "@/views/Team";

export default async function TeamPage() {
  const advogadosRes = await getAdvogadosPublicos();

  return <TeamView advogados={advogadosRes.data} />;
}
