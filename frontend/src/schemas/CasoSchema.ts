import { z } from "zod";

const casoClientePayloadSchema = z.object({
  id: z.string().uuid("ID do cliente inválido"),
  papel: z.enum(["autor", "réu", "interveniente", "testemunha"]),
});

export const createCasoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(255),
  numero_processo: z.string().max(255).optional().nullable(),
  descricao: z.string().optional().nullable(),
  status: z.enum(["aberto", "em_andamento", "encerrado", "arquivado"]),
  data_abertura: z.string().min(1, "Data de abertura é obrigatória"),
  data_encerramento: z.string().optional().nullable(),
  advogado_id: z.string().uuid().optional().nullable(),
  categorias: z.array(z.string().uuid()).optional(),
  clientes: z.array(casoClientePayloadSchema).optional(),
});

export const updateCasoSchema = createCasoSchema.partial().extend({
  status: z.enum(["aberto", "em_andamento", "encerrado", "arquivado"]).optional(),
});

export const syncClientesCasoSchema = z.object({
  clientes: z
    .array(casoClientePayloadSchema)
    .min(1, "Informe ao menos um cliente"),
});

export const uploadAnexoCasoSchema = z.object({
  arquivo: z.instanceof(File, { message: "Arquivo é obrigatório" }),
  nome: z.string().optional(),
});

export type CreateCasoPayload = z.infer<typeof createCasoSchema>;
export type UpdateCasoPayload = z.infer<typeof updateCasoSchema>;
export type SyncClientesCasoPayload = z.infer<typeof syncClientesCasoSchema>;
export type UploadAnexoCasoPayload = z.infer<typeof uploadAnexoCasoSchema>;
export type CasoClientePayload = z.infer<typeof casoClientePayloadSchema>;
