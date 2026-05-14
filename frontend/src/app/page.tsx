import HomeView from "@/views/Home";
import { getPublicacoesPublicas } from "@/api/publicacoes/apiPublicacoes";

export default async function HomePage() {
  const publicacoesPublicas = await getPublicacoesPublicas();

  return <HomeView publicacoes={publicacoesPublicas} />;
}
