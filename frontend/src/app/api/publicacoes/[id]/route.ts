import { getPublicApiOrigin } from "@/configs/apiUrl";
import { getSafePayloadErrorMessage } from "@/utils/safeErrorMessage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendApiBaseUrl = () => {
  const origin = getPublicApiOrigin() || "http://127.0.0.1:8000";
  return `${origin.replace(/\/$/, "")}/api`;
};

const getForwardHeaders = (request: NextRequest, hasBody = false) => {
  const headers = new Headers({ Accept: "application/json" });
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

const getId = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  return encodeURIComponent(id);
};

const proxyPublicacao = async (
  request: NextRequest,
  id: string,
  init: RequestInit = {},
) => {
  const response = await fetch(`${getBackendApiBaseUrl()}/publicacoes/${id}`, {
    ...init,
    cache: "no-store",
    headers: getForwardHeaders(request, Boolean(init.body)),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { message: getSafePayloadErrorMessage(payload, "Erro ao processar publicação.") },
      { status: response.status },
    );
  }

  if (response.status === 204 || init.method === "DELETE") {
    return NextResponse.json(payload ?? { message: "Publicação removida." });
  }

  return NextResponse.json(payload, { status: response.status });
};

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => proxyPublicacao(request, await getId(params));

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");
  const body = isMultipart ? await request.formData() : await request.text();

  if (body instanceof FormData) {
    body.set("_method", "PUT");
  }

  return proxyPublicacao(request, await getId(params), {
    method: isMultipart ? "POST" : "PUT",
    body,
  });
};

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");
  const body = isMultipart ? await request.formData() : await request.text();

  return proxyPublicacao(request, await getId(params), { method: "POST", body });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => proxyPublicacao(request, await getId(params), { method: "DELETE" });