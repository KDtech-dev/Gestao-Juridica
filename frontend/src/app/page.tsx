import HomeView from "@/views/Home";
import { getAdvogadosPublicos } from "@/api/ApiAdvogados";
import { TeamLawyer } from "@/data/team";
import { AdvogadoPublicoType } from "@/@core/types";

function toTeamLawyer(u: AdvogadoPublicoType): TeamLawyer {
  const adv = u.advogado;
  return {
    id: u.id,
    name: u.name,
    role: adv?.categorias?.[0]?.nome ?? "Advogado(a)",
    oab: adv ? `OAB/${adv.oab_uf} ${adv.oab_numero}` : "",
    image: adv?.foto_perfil_url ?? "",
    description: adv?.resumo_pessoal ?? "",
    specialties: adv?.categorias?.map((c) => c.nome) ?? [],
  };
}

export default async function HomePage() {
  const [ advogadosRes] = await Promise.all([
    getAdvogadosPublicos(),
  ]);

  const lawyers = advogadosRes.data.map(toTeamLawyer);

  return <HomeView  lawyers={lawyers} />;
}