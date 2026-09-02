import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const createClienteSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("name.required")).max(255, t("name.max")),

    cpf_cnpj: z
      .string()
      .min(1, t("cpf_cnpj.required"))
      .refine((val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 11 || digits.length === 14;
      }, t("cpf_cnpj.invalid")),

    email: z.string().min(1, t("email.required")).email(t("email.invalid")),

    telefone: z.string().max(20).optional(),

    endereco_id: z.number().optional(),

    data_nascimento: z.string().optional(),

    foto_perfil: z
      .instanceof(File, {
        message: t("foto_perfil.image"),
      })
      .optional(),
  });

export const updateClienteSchema = (t: TFunction) =>
  createClienteSchema(t).partial();

export type CreateClientePayload = z.infer<
  ReturnType<typeof createClienteSchema>
>;

export type UpdateClientePayload = z.infer<
  ReturnType<typeof updateClienteSchema>
>;
