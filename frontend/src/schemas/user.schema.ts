import { z } from "zod";

const cpfRegex = /^\d{11}$/;

export const userTypeSchema = z.enum(["admin", "advogado", "funcionario"]);

export const newUserSchema = z
  .object({
    type: userTypeSchema,
    name: z.string().trim().min(1, "Informe o nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    cpf: z
      .string()
      .transform((value) => value.replace(/\D/g, "").slice(0, 11))
      .refine((value) => cpfRegex.test(value), "Informe 11 dígitos."),
    phone: z.string().trim().optional(),
    oabNumber: z.string().trim().optional(),
    areas: z.array(z.string().trim().min(1)).optional(),
    position: z.string().trim().optional(),
    password: z
      .string()
      .min(1, "Informe a senha.")
      .min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a senha."),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas precisam ser iguais.",
      });
    }

    if (value.type === "funcionario" && !value.position?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["position"],
        message: "Informe o cargo/função.",
      });
    }
  });

export type NewUserInput = z.input<typeof newUserSchema>;
export type NewUserPayload = z.output<typeof newUserSchema>;

export const userModalSchema = z
  .object({
    isEdit: z.boolean(),
    type: userTypeSchema,
    name: z.string().trim().min(1, "Informe o nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    cpf: z.string(),
    phone: z.string().trim().optional(),
    oabNumber: z.string().trim().optional(),
    areas: z.array(z.string().trim().min(1)).optional(),
    position: z.string().trim().optional(),
    active: z.boolean(),
    password: z.string(),
    confirmPassword: z.string(),
    changePassword: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.isEdit) {
      const cpf = value.cpf.replace(/\D/g, "").slice(0, 11);
      if (!cpfRegex.test(cpf)) {
        ctx.addIssue({
          code: "custom",
          path: ["cpf"],
          message: "Informe 11 dígitos.",
        });
      }
    }

    if (value.type === "funcionario" && !value.position?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["position"],
        message: "Informe o cargo/função.",
      });
    }

    if (!value.isEdit || value.changePassword) {
      if (value.password.length < 6) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "A senha deve ter pelo menos 6 caracteres.",
        });
      }

      if (value.password !== value.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "As senhas precisam ser iguais.",
        });
      }
    }
  });

export type UserModalInput = z.input<typeof userModalSchema>;
