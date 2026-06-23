import { getPublicacoesPublicas } from "@/api/apiPublicacoes";
import HomeView from "@/views/Home";

export default async function HomePage() {
  const response = await getPublicacoesPublicas();

  return <HomeView publicacoes={response.data} />;
}
