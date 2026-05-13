import ErrorScreenTemplate from "@/components/ErrorScreenTemplate";

export default function NotFound() {
  return (
    <ErrorScreenTemplate
      title="Tela não encontrada"
      description="Não encontramos a tela solicitada. Verifique se você tem acesso ou retorne para a página inicial."
    />
  );
}
