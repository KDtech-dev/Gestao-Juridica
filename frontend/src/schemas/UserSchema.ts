import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

const onlyNumbers = (value: string = "") => value.replace(/\D/g, "");

const passwordRules = (t: TFunction) =>
  z
    .string()
    .min(1, t("password.required"))
    .min(8, t("password.min"))
    .regex(/[A-Za-z]/, t("password.complexity"))
    .regex(/\d/, t("password.complexity"));

export const UF_SIGLAS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

const OAB_REGEX = /^\d{1,6}[ABD]?$/;

const sexoEnum = z.enum([
  "masculino",
  "feminino",
  "outro",
  "prefiro_nao_dizer",
]);
const roleEnum = z.enum(["funcionario", "advogado", "admin"]);

const createEnderecoSchema = (t: TFunction) =>
  z.object({
    logradouro: z
      .string()
      .min(1, t("logradouro.required"))
      .max(255, t("logradouro.max")),
    numero: z.string().min(1, t("numero.required")).max(20, t("numero.max")),
    complemento: z
      .string()
      .max(100, t("complemento.max"))
      .optional()
      .nullable(),
    bairro: z.string().min(1, t("bairro.required")).max(100, t("bairro.max")),
    cidade: z.string().min(1, t("cidade.required")).max(100, t("cidade.max")),
    uf: z.string().length(2, t("uf.size")),
    cep: z.string().length(8, t("cep.size")),
  });

const createFuncionarioSchema = (t: TFunction) =>
  z.object({
    data_nascimento: z.string().optional().nullable(),
    sexo: sexoEnum.optional().nullable(),
    celular: z
      .string()
      .transform((val) => onlyNumbers(val))
      .refine(
        (val) => val.length === 0 || val.length === 10 || val.length === 11,
        { message: t("celular.size") },
      )
      .optional()
      .nullable(),
    resumo_pessoal: z.string().max(2000, t("resumo.max")).optional().nullable(),
    foto_perfil: z
      .instanceof(File, { message: t("foto_perfil.image") })
      .optional()
      .nullable(),
  });

const createAdvogadoSchema = (t: TFunction) =>
  z.object({
    data_nascimento: z.string().optional().nullable(),
    sexo: sexoEnum.optional().nullable(),
    celular: z
      .string()
      .transform((val) => onlyNumbers(val))
      .refine(
        (val) => val.length === 0 || val.length === 10 || val.length === 11,
        { message: t("celular.size") },
      )
      .optional()
      .nullable(),
    resumo_pessoal: z.string().max(2000, t("resumo.max")).optional().nullable(),
    foto_perfil: z
      .instanceof(File, { message: t("foto_perfil.image") })
      .optional()
      .nullable(),
    oab_numero: z
      .string()
      .transform((val) => val.toUpperCase().trim())
      .refine((val) => !val || OAB_REGEX.test(val), {
        message: t("oab_numero.invalid"),
      })
      .optional()
      .nullable(),
    oab_uf: z
      .string()
      .transform((val) => val.toUpperCase().trim())
      .refine(
        (val) => !val || (val.length === 2 && UF_SIGLAS.includes(val as any)),
        { message: t("oab_uf.invalid") },
      )
      .optional()
      .nullable(),
    categorias: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .nullable(),
  });

export const createUserBaseSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, t("name.required")).max(255, t("name.max")),
    email: z.string().min(1, t("email.required")).email(t("email.invalid")),
    cpf: z
      .string()
      .transform((val) => onlyNumbers(val))
      .refine((val) => val.length === 11, t("cpf.size")),
    password: passwordRules(t),
    password_confirmation: z
      .string()
      .min(1, t("password_confirmation.required")),
    role: roleEnum,
    endereco: createEnderecoSchema(t).optional(),
    funcionario: createFuncionarioSchema(t).optional(),
    advogado: createAdvogadoSchema(t).optional(),
  });

export const createUserSchema = (t: TFunction) =>
  createUserBaseSchema(t).superRefine((data, ctx) => {
    if (data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: "custom",
        message: t("password_confirmation.same"),
        path: ["password_confirmation"],
      });
    }

    if (data.role === "advogado") {
      const oabNumero = data.advogado?.oab_numero?.trim();
      const oabUf = data.advogado?.oab_uf?.trim();

      if (!oabNumero) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_numero.required_if"),
          path: ["advogado", "oab_numero"],
        });
      } else if (!OAB_REGEX.test(oabNumero)) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_numero.invalid"),
          path: ["advogado", "oab_numero"],
        });
      }

      if (!oabUf) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_uf.required_if"),
          path: ["advogado", "oab_uf"],
        });
      } else if (!UF_SIGLAS.includes(oabUf as any)) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_uf.invalid"),
          path: ["advogado", "oab_uf"],
        });
      }
    }
  });

export const updateUserBaseSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("name.required"))
      .max(255, t("name.max"))
      .optional(),
    email: z.string().email(t("email.invalid")).optional(),
    cpf: z
      .string()
      .transform((val) => onlyNumbers(val))
      .refine((val) => !val || val.length === 11, t("cpf.size"))
      .optional(),
    password: passwordRules(t).optional(),
    password_confirmation: z.string().optional(),
    role: roleEnum.optional(),
    cor_perfil: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional()
      .nullable(),
    endereco: createEnderecoSchema(t).partial().optional().nullable(),
    funcionario: createFuncionarioSchema(t).partial().optional(),
    advogado: createAdvogadoSchema(t).partial().optional(),
  });

export const updateUserSchema = (t: TFunction) =>
  updateUserBaseSchema(t).superRefine((data, ctx) => {
    if (
      data.password &&
      data.password_confirmation &&
      data.password !== data.password_confirmation
    ) {
      ctx.addIssue({
        code: "custom",
        message: t("password_confirmation.same"),
        path: ["password_confirmation"],
      });
    }

    if (data.role === "advogado") {
      const oabNumero = data.advogado?.oab_numero?.trim();
      const oabUf = data.advogado?.oab_uf?.trim();

      if (oabNumero && !OAB_REGEX.test(oabNumero)) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_numero.invalid"),
          path: ["advogado", "oab_numero"],
        });
      }

      if (oabUf && (!UF_SIGLAS.includes(oabUf as any) || oabUf.length !== 2)) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_uf.invalid"),
          path: ["advogado", "oab_uf"],
        });
      }

      if (oabNumero && !oabUf) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_uf.required_if"),
          path: ["advogado", "oab_uf"],
        });
      }
      if (oabUf && !oabNumero) {
        ctx.addIssue({
          code: "custom",
          message: t("oab_numero.required_if"),
          path: ["advogado", "oab_numero"],
        });
      }
    }
  });

export type CreateUserPayload = z.infer<ReturnType<typeof createUserSchema>>;
export type UpdateUserPayload = z.infer<ReturnType<typeof updateUserSchema>>;
