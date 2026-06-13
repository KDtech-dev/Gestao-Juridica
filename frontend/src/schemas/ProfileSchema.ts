import { z } from "zod";
import { updateUserSchema } from "@/schemas/UserSchema";

export const profileFormSchema = updateUserSchema.extend({
  tema: z.enum(["light", "dark", "system"]),
  idioma: z.enum(["pt", "en", "es"]),
  cor_perfil: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
});

export type ProfileFormSchemaType = z.infer<typeof profileFormSchema>;
