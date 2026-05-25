import { z } from "zod";

export const createClienteSchema = z.object({
  name:             z.string().min(1, "Nome é obrigatório").max(255),
  cpf_cnpj:         z.string().min(11, "CPF/CNPJ inválido").max(14),
  email:            z.string().email("E-mail inválido"),
  telefone:         z.string().max(20).optional(),
  endereco_id:      z.number().optional(),
  data_nascimento:  z.string().optional(),
  foto_perfil:      z.instanceof(File).optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClientePayload = z.infer<typeof createClienteSchema>;
export type UpdateClientePayload = z.infer<typeof updateClienteSchema>;