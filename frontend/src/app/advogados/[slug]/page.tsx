import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { getAdvogadosPublicos } from "@/api/ApiAdvogados";
import {
  advogadoHref,
  advogadoIdFromSlug,
  advogadoSlug,
} from "@/utils/advogadoPublico";
import { stripHtml } from "@/@core/format";
import { getTranslation } from "@/services/i18n";
import AdvogadoPublicoView from "@/views/AdvogadoPublico";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const loadProfile = cache(async (slug: string) => {
  const id = advogadoIdFromSlug(slug);
  if (!id) notFound();
  const { data: lawyers } = await getAdvogadosPublicos();
  const lawyer = lawyers.find(
    (item) => item.uuid.toLowerCase() === id.toLowerCase(),
  );
  if (!lawyer) notFound();
  // The UUID keeps previously shared links working after a name change.
  if (slug !== advogadoSlug(lawyer)) permanentRedirect(advogadoHref(lawyer));
  return {
    lawyer,
    others: lawyers.filter((item) => item.uuid !== lawyer.uuid).slice(0, 3),
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lawyer } = await loadProfile((await params).slug);
  const savedLocale = (await cookies()).get("idioma")?.value;
  const locale =
    savedLocale === "en" || savedLocale === "es" ? savedLocale : "pt";
  const title = `${lawyer.name} | ${getTranslation(locale, "branding.appName")}`;
  const description =
    stripHtml(lawyer.resumo_pessoal ?? "").slice(0, 160) || title;
  // Relative storage paths remain valid in HTML; OG requires an absolute public URL.
  const image = lawyer.foto_perfil_url;
  const images =
    image && /^https?:\/\//.test(image)
      ? [{ url: image, alt: lawyer.name }]
      : undefined;
  return {
    title,
    description,
    openGraph: { type: "profile", title, description, images },
  };
}

export default async function AdvogadoPage({ params }: Props) {
  const { lawyer, others } = await loadProfile((await params).slug);
  return <AdvogadoPublicoView lawyer={lawyer} others={others} />;
}
