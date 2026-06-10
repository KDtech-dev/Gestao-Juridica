import { z } from "zod";
import { updateUserSchema } from "@/schemas/UserSchema";

export const profileFormSchema = updateUserSchema.extend({
  tema:   z.enum(["light", "dark", "system"]),
  idioma: z.enum(["pt", "en", "es"]),
});

export type ProfileFormSchemaType = z.infer<typeof profileFormSchema>;