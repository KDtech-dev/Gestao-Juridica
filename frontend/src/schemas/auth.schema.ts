import { z } from "zod";

const cpfRegex = /^\d{11}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Informe CPF ou email")
    .refine((value) => {
      const clean = value.replace(/\D/g, "");
      const isCpf = cpfRegex.test(clean);
      const isEmail = z.string().email().safeParse(value).success;
      return isCpf || isEmail;
    }, "Informe um CPF ou email válido"),
  password: z.string().min(1, "Senha obrigatória"),
  remember: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
