import { headers } from "next/headers";
import type { DemoLocale } from "@/data/publicDemo";

export async function getRequestLocale(): Promise<DemoLocale> {
  const locale = (await headers()).get("x-locale");
  return locale === "en" || locale === "es" ? locale : "pt";
}
