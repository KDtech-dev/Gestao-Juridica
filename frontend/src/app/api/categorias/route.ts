import { getPublicApiOrigin } from "@/configs/apiUrl";
import type { CategoriaOption } from "@/api/categorias/types";
import { getSafePayloadErrorMessage } from "@/utils/safeErrorMessage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendApiBaseUrl = () => {
  const origin = getPublicApiOrigin() || "http://127.0.0.1:8000";

  return `${origin.replace(/\/$/, "")}/api`;
};

const normalizeCategorias = (payload: unknown): CategoriaOption[] => {
  const data =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (!Array.isArray(data)) return [];

  return data
    .map((item) => item as Partial<CategoriaOption>)
    .filter((item) => item.id !== undefined && typeof item.nome === "string")
    .map((item) => ({
      id: item.id as number | string,
      nome: item.nome as string,
      descricao: item.descricao ?? null,
    }));
};

export const GET = async () => {
  const response = await fetch(`${getBackendApiBaseUrl()}/categorias`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      {
        message: getSafePayloadErrorMessage(
          payload,
          "Erro ao buscar categorias.",
        ),
      },
      { status: response.status },
    );
  }

  return NextResponse.json(normalizeCategorias(payload), {
    status: response.status,
  });
};
