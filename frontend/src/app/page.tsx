import { getAdvogadosPublicos } from "@/api/ApiAdvogados";
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";
import HomeView from "@/views/Home";

export default async function HomePage() {
  const [publicacoesRes, advogadosRes] = await Promise.all([
    getPublicacoesPublicas(),
    getAdvogadosPublicos(),
  ]);

  return (
    <HomeView publicacoes={publicacoesRes.data} advogados={advogadosRes.data} />
  );
}
