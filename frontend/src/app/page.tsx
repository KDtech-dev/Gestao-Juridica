
import { getPublicacoesPublicas } from "@/api/apiPublicacoes";
import HomeView from "@/views/Home";

export default async function HomePage() {
  const publicacoesPublicas = await getPublicacoesPublicas();

  return <HomeView publicacoes={publicacoesPublicas} />;
}
