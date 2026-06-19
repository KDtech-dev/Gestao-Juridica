import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations>;

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

    celular: z.string().max(20).optional().nullable(),

    resumo_pessoal: z.string().max(2000, t("resumo.max")).optional().nullable(),

    foto_perfil: z
      .instanceof(File, {
        message: t("foto_perfil.image"),
      })
      .optional()
      .nullable(),
  });

const createAdvogadoSchema = (t: TFunction) =>
  z.object({
    data_nascimento: z.string().optional().nullable(),

    sexo: sexoEnum.optional().nullable(),

    celular: z.string().max(20).optional().nullable(),

    resumo_pessoal: z.string().max(2000, t("resumo.max")).optional().nullable(),

    foto_perfil: z
      .instanceof(File, {
        message: t("foto_perfil.image"),
      })
      .optional()
      .nullable(),

    oab_numero: z.string().min(1, t("oab_numero.required_if")).max(20),

    oab_uf: z.string().length(2, t("oab_uf.required_if")),

    categorias: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .nullable(),
  });

export const createUserSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(1, t("name.required")).max(255, t("name.max")),

      email: z.string().min(1, t("email.required")).email(t("email.invalid")),

      cpf: z
        .string()
        .refine(
          (value) => value.replace(/\D/g, "").length === 11,
          t("cpf.size"),
        ),

      password: z.string().min(8, t("password.min")),

      password_confirmation: z
        .string()
        .min(1, t("password_confirmation.required")),

      role: roleEnum,

      endereco: createEnderecoSchema(t).optional(),

      funcionario: createFuncionarioSchema(t).optional(),

      advogado: createAdvogadoSchema(t).optional(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("password_confirmation.same"),
      path: ["password_confirmation"],
    })
    .refine((data) => data.role !== "advogado" || !!data.advogado?.oab_numero, {
      message: t("oab_numero.required_if"),
      path: ["advogado", "oab_numero"],
    })
    .refine((data) => data.role !== "advogado" || !!data.advogado?.oab_uf, {
      message: t("oab_uf.required_if"),
      path: ["advogado", "oab_uf"],
    });

export const updateUserSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, t("name.required"))
      .max(255, t("name.max"))
      .optional(),

    email: z.string().email(t("email.invalid")).optional(),

    cpf: z
      .string()
      .refine((val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length === 11;
      }, t("cpf.size"))
      .optional(),

    password: z.string().min(8, t("password.min")).optional(),

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

export type CreateUserPayload = z.infer<ReturnType<typeof createUserSchema>>;

export type UpdateUserPayload = z.infer<ReturnType<typeof updateUserSchema>>;
