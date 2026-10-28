import { z } from "zod";
import type { useTranslations } from "next-intl";
import { updateUserBaseSchema } from "@/schemas/UserSchema";

type TFunction = ReturnType<typeof useTranslations>;

export const createProfileFormSchema = (t: TFunction) =>
  updateUserBaseSchema(t).extend({
    tema: z.enum(["system", "light", "dark"]),
    idioma: z.enum(["pt", "en", "es"]),
  });

type ProfileFormSchema = ReturnType<typeof createProfileFormSchema>;

export type ProfileFormSchemaType = z.input<ProfileFormSchema>;
export type ProfileFormOutputType = z.output<ProfileFormSchema>;
