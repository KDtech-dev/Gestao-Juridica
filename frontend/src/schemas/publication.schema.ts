import { z } from "zod";

const fileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
);

export const publicationSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título."),
  categoria: z.string().trim().min(1, "Informe a categoria."),
  categoriaId: z.string().trim().min(1, "Selecione uma categoria."),
  bannerImage: z.union([
    fileSchema,
    z.string().trim(),
  ]),
  autor: z.string().trim().min(1, "Informe o nome do autor."),
  resumo: z
    .string()
    .trim()
    .min(1, "Informe o resumo.")
    .max(2000, "O resumo deve ter no máximo 2000 caracteres."),
  conteudo: z.string().trim().min(1, "Informe o texto da publicação."),
  status: z.enum(["rascunho", "publicado", "arquivado"], {
    message: "Informe um status válido.",
  }),
});

export type PublicationInput = z.infer<typeof publicationSchema>;
