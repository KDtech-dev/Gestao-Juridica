import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

const cpfRegex = /^\d{11}$/;

export const loginSchema = (t: TFunction) =>
  z.object({
    identifier: z
      .string()
      .trim()
      .min(3, t("identifier.required"))
      .refine((value) => {
        const clean = value.replace(/\D/g, "");
        const isCpf = cpfRegex.test(clean);
        const isEmail = z.string().email().safeParse(value).success;
        return isCpf || isEmail;
      }, t("identifier.invalid")),
    password: z.string().min(1, t("password.required")),
    remember: z.boolean(),
  });

export type LoginInput = z.infer<ReturnType<typeof loginSchema>>;
