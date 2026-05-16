import { getPublicApiOrigin } from "@/configs/apiUrl";
import {
  mapApiPublicacaoToItem,
} from "@/api/publicacoes/apiPublicacoes";
import type { ApiPublicacao } from "@/api/publicacoes/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendApiBaseUrl = () => {
  const origin = getPublicApiOrigin() || "http://127.0.0.1:8000";

  return `${origin.replace(/\/$/, "")}/api`;
};

const getForwardHeaders = (request: NextRequest, hasBody = false) => {
  const headers = new Headers({
    Accept: "application/json",
  });
  const authorization = request.headers.get("authorization");
  const cookieToken = request.cookies.get("authToken")?.value;
  const contentType = request.headers.get("content-type") ?? "";

  if (hasBody && !contentType.includes("multipart/form-data")) {
    headers.set("Content-Type", "application/json");
  }

  if (authorization) {
    headers.set("Authorization", authorization);
  } else if (cookieToken) {
    headers.set("Authorization", `Bearer ${cookieToken}`);
  }

  return headers;
};

const toPublicResponse = (payload: unknown) => {
  const data =
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (Array.isArray(data)) {
    return data.map((item) => mapApiPublicacaoToItem(item as ApiPublicacao));
  }

  return mapApiPublicacaoToItem(data as ApiPublicacao);
};

const proxyPublicacoes = async (
  request: NextRequest,
  init: RequestInit = {},
) => {
  const response = await fetch(`${getBackendApiBaseUrl()}/publicacoes`, {
    ...init,
    cache: "no-store",
    headers: getForwardHeaders(request, Boolean(init.body)),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { message: payload?.message ?? "Erro ao processar publicação." },
      { status: response.status },
    );
  }

  return NextResponse.json(toPublicResponse(payload), {
    status: response.status,
  });
};

export const GET = (request: NextRequest) => proxyPublicacoes(request);

export const POST = async (request: NextRequest) => {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.text();

  return proxyPublicacoes(request, {
    method: "POST",
    body,
  });
};
