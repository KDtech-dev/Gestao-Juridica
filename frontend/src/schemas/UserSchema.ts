import { z } from "zod";

const sexoEnum = z.enum([
  "masculino",
  "feminino",
  "outro",
  "prefiro_nao_dizer",
]);

const roleEnum = z.enum(["funcionario", "advogado", "admin"]);

const enderecoSchema = z.object({
  logradouro:  z.string().min(1, "Logradouro é obrigatório").max(255),
  numero:      z.string().min(1, "Número é obrigatório").max(20),
  complemento: z.string().max(100).optional(),
  bairro:      z.string().min(1, "Bairro é obrigatório").max(100),
  cidade:      z.string().min(1, "Cidade é obrigatória").max(100),
  uf:          z.string().length(2, "UF deve ter 2 caracteres"),
  cep:         z.string().length(8, "CEP deve ter 8 dígitos (sem hífen)"),
});

const funcionarioSchema = z.object({
  data_nascimento: z.string().optional(),
  sexo:            sexoEnum.optional(),
  celular:         z.string().max(20).optional(),
  resumo_pessoal:  z.string().max(2000).optional(),
  foto_perfil:     z.instanceof(File).optional(),
});

const advogadoSchema = z.object({
  data_nascimento: z.string().optional(),
  sexo:            sexoEnum.optional(),
  celular:         z.string().max(20).optional(),
  resumo_pessoal:  z.string().max(2000).optional(),
  foto_perfil:     z.instanceof(File).optional(),
  oab_numero:      z.string().min(1, "Número da OAB é obrigatório").max(20),
  oab_uf:          z.string().length(2, "UF da OAB deve ter 2 caracteres"),
  especialidade:   z.array(z.string()).optional(),
});

export const createUserSchema = z
  .object({
    name:     z.string().min(1, "Nome é obrigatório").max(255),
    email:    z.string().email("E-mail inválido"),
    cpf:      z.string().length(11, "CPF deve ter 11 dígitos (sem pontuação)"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    password_confirmation: z.string(),
    role:     roleEnum,
    endereco: enderecoSchema.optional(),
    funcionario: funcionarioSchema.optional(),
    advogado:    advogadoSchema.optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não coincidem",
    path: ["password_confirmation"],
  })
  .refine(
    (data) => data.role !== "advogado" || data.advogado?.oab_numero,
    {
      message: "Número da OAB é obrigatório para advogados",
      path: ["advogado", "oab_numero"],
    },
  )
  .refine(
    (data) => data.role !== "advogado" || data.advogado?.oab_uf,
    {
      message: "UF da OAB é obrigatória para advogados",
      path: ["advogado", "oab_uf"],
    },
  );

export const updateUserSchema = z.object({
  name:     z.string().min(1).max(255).optional(),
  email:    z.string().email("E-mail inválido").optional(),
  cpf:      z.string().length(11, "CPF deve ter 11 dígitos (sem pontuação)").optional(),
  password: z.string().min(8).optional(),
  password_confirmation: z.string().optional(),
  role:     roleEnum.optional(),
  endereco: enderecoSchema.optional().nullable(),
  funcionario: funcionarioSchema.partial().optional(),
  advogado:    advogadoSchema.partial().optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
