import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

export const COMPROMISSO_TIPOS = [
    "COMPROMISSO",
    "LEMBRETE",
    "AUDIENCIA",
    "PRAZO",
    "REUNIAO",
] as const;

export const COMPROMISSO_STATUS = [
    "PENDENTE",
    "CONCLUIDO",
    "CANCELADO",
] as const;

export const createCompromissoSchema = (t: TFunction) =>
    z
        .object({
            titulo: z.string().min(1, t("titulo.required")).max(255, t("titulo.max")),
            tipo: z.enum(COMPROMISSO_TIPOS),
            status: z.enum(COMPROMISSO_STATUS),
            startsAt: z.date().nullable(),
            descricao: z.string().optional().nullable(),
            userId: z.string().min(1, t("userId.required")),
        })
        .superRefine((data, ctx) => {
            if (!data.startsAt) {
                ctx.addIssue({
                    code: "custom",
                    message: t("startsAt.required"),
                    path: ["startsAt"],
                });
                return;
            }

            if (data.startsAt.getTime() < Date.now()) {
                ctx.addIssue({
                    code: "custom",
                    message: t("startsAt.before_now"),
                    path: ["startsAt"],
                });
            }
        });
export type CompromissoFormValues = z.infer<ReturnType<typeof createCompromissoSchema>>;