import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const createCasoClientePayloadSchema = () =>
  z.object({
    id: z.string(),
    papel: z.enum(["autor", "réu", "interveniente", "testemunha"]),
  });

export const createCasoSchema = (t: TFunction) =>
  z.object({
    titulo: z.string().min(1, t("titulo.required")).max(255, t("titulo.max")),

    numero_processo: z
      .string()
      .min(20, t("numero_processo.min"))
      .max(255, t("numero_processo.max"))
      .optional()
      .nullable(),

    descricao: z.string().optional().nullable(),

    status: z.enum(["aberto", "em_andamento", "encerrado", "arquivado"], {
      message: t("status.in"),
    }),

    data_abertura: z.string().min(1, t("data_abertura.required")),
    data_encerramento: z.string().optional().nullable(),

    advogado_id: z.string().optional().nullable(),

    categorias: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .nullable(),

    clientes: z.array(createCasoClientePayloadSchema()).optional(),

    anexos: z.array(z.instanceof(File)).optional(),
    anexos_remover: z.array(z.string()).optional(),
  });

export const updateCasoSchema = (t: TFunction) =>
  createCasoSchema(t)
    .partial()
    .extend({
      status: z
        .enum(["aberto", "em_andamento", "encerrado", "arquivado"])
        .optional(),
    });

export const syncClientesCasoSchema = (t: TFunction) =>
  z.object({
    clientes: z.array(createCasoClientePayloadSchema()).optional(),
  });

export type CreateCasoPayload = z.infer<ReturnType<typeof createCasoSchema>>;

export type UpdateCasoPayload = z.infer<ReturnType<typeof updateCasoSchema>>;

export type SyncClientesCasoPayload = z.infer<ReturnType<typeof syncClientesCasoSchema>>;

export type CasoClientePayload = z.infer<ReturnType<typeof createCasoClientePayloadSchema>>;
