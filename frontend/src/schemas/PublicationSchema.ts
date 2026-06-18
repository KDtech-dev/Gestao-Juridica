import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const createPublicacaoSchema = (t: TFunction) =>
  z.object({
    titulo: z.string().min(1, t("titulo.required")).max(255, t("titulo.max")),
    categoria_id: z
      .string()
      .min(1, t("categoria_id.required"))
      .optional()
      .nullable(),
    imagem_caminho: z
      .string()
      .max(255, t("imagem_caminho.max"))
      .optional()
      .nullable(),
    imagem: z
      .instanceof(File, { message: t("imagem.invalid") })
      .optional()
      .nullable(),

    autor: z.string().min(1, t("autor.required")).max(255, t("autor.max")),
    resumo: z.string().max(2000, t("resumo.max")).optional().nullable(),
    conteudo: z.string().optional().nullable(),
    status: z.enum(["rascunho", "publicado", "arquivado"], {
      message: t("status.in"),
    }),

    publicado_em: z.string().datetime().optional().nullable(),
    anexos: z
      .array(z.instanceof(File, { message: t("anexos.invalid") }))
      .optional()
      .nullable(),
  });

export const updatePublicacaoSchema = (t: TFunction) =>
  createPublicacaoSchema(t).partial();

export const uploadAnexoPublicacaoSchema = (t: TFunction) =>
  z.object({
    anexos: z
      .array(z.instanceof(File, { message: t("anexos.invalid") }))
      .min(1, t("anexos.required")),
  });

export type CreatePublicacaoPayload = z.infer<
  ReturnType<typeof createPublicacaoSchema>
>;

export type UpdatePublicacaoPayload = z.infer<
  ReturnType<typeof updatePublicacaoSchema>
>;

export type UploadAnexoPublicacaoPayload = z.infer<
  ReturnType<typeof uploadAnexoPublicacaoSchema>
>;

export type AnexoPublicacao = File;

export const STATUS_OPTIONS = ["rascunho", "publicado", "arquivado"] as const;
export type StatusPublicacao = (typeof STATUS_OPTIONS)[number];
