import { z } from "zod";

export const schema = z.object({
  nome: z
    .string()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .optional()
    .or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .refine((value) => value === "" || value.length >= 10, "Telefone inválido")
    .optional(),
  cpf: z
    .string()
    .refine((value) => value === "" || value.length >= 11, "CPF inválido")
    .optional(),
  oabNumber: z.string().optional(),
  position: z.string().optional(),
  categoria_ids: z
    .array(z.number())
    .min(1, "Você deve selecionar pelo menos uma categoria"),
});

export const profileFormSchema = schema.extend({
  tema: z.enum(["light", "dark", "system"]),

  idioma: z.enum(["pt", "en", "es"]),
});

export type ProfileSchemaType = z.infer<typeof schema>;

export type ProfileFormSchemaType = z.infer<typeof profileFormSchema>;
