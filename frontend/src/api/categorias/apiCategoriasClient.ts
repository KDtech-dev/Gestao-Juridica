"use client";

import type { CategoriaOption } from "./types";

export const listarCategoriasClient = async (): Promise<CategoriaOption[]> => {
  const response = await fetch("/api/categorias", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as categorias.");
  }

  return (await response.json()) as CategoriaOption[];
};
