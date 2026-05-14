import NewPublicationView from "@/views/NewPublication";

export default async function EditarPublicacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <NewPublicationView editSlug={slug} />;
}
