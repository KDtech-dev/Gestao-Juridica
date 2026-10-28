export const PROFILE_COLORS = [
  "#2563eb",
  "#ea580c",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#ca8a04",
  "#92400e",
  "#0d9488",
  "#4f46e5",
  "#65a30d",
  "#c026d3",
  "#f43f5e",
  "#a16207",
  "#0284c7",
  "#000000",
  "#ffffff",
] as const;

export const PROFILE_COLOR_NAMES: Record<
  (typeof PROFILE_COLORS)[number],
  { pt: string; en: string; es: string }
> = {
  "#2563eb": { pt: "Azul", en: "Blue", es: "Azul" },
  "#ea580c": { pt: "Laranja", en: "Orange", es: "Naranja" },
  "#16a34a": { pt: "Verde", en: "Green", es: "Verde" },
  "#dc2626": { pt: "Vermelho", en: "Red", es: "Rojo" },
  "#7c3aed": { pt: "Violeta", en: "Violet", es: "Violeta" },
  "#0891b2": { pt: "Ciano", en: "Cyan", es: "Cian" },
  "#db2777": { pt: "Rosa", en: "Pink", es: "Rosa" },
  "#ca8a04": { pt: "Dourado", en: "Gold", es: "Dorado" },
  "#92400e": { pt: "Marrom", en: "Brown", es: "Marrón" },
  "#0d9488": { pt: "Turquesa", en: "Teal", es: "Turquesa" },
  "#4f46e5": { pt: "Índigo", en: "Indigo", es: "Índigo" },
  "#65a30d": { pt: "Lima", en: "Lime", es: "Lima" },
  "#c026d3": { pt: "Magenta", en: "Magenta", es: "Magenta" },
  "#f43f5e": { pt: "Coral", en: "Coral", es: "Coral" },
  "#a16207": { pt: "Âmbar", en: "Amber", es: "Ámbar" },
  "#0284c7": { pt: "Azul celeste", en: "Sky blue", es: "Azul celeste" },
  "#000000": { pt: "Preto", en: "Black", es: "Negro" },
  "#ffffff": { pt: "Branco", en: "White", es: "Blanco" },
};

export type ProfileColorLocale = "pt" | "en" | "es";

export function profileColorName(
  color: string | null | undefined,
  locale: ProfileColorLocale,
): string {
  if (!color) return PROFILE_COLOR_NAMES[PROFILE_COLORS[0]][locale];
  return PROFILE_COLOR_NAMES[
    color.toLowerCase() as keyof typeof PROFILE_COLOR_NAMES
  ]?.[locale] ?? PROFILE_COLOR_NAMES[PROFILE_COLORS[0]][locale];
}

export function profileColorTextColor(color: string | null | undefined): string {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return "#fff";

  const channels = [1, 3, 5].map((index) =>
    parseInt(color.slice(index, index + 2), 16) / 255,
  );
  const luminance = channels
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

  return luminance > 0.4 ? "#1f2937" : "#fff";
}
