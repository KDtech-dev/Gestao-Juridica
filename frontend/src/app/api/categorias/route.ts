import { getPublicApiOrigin } from "@/configs/apiUrl";
import { getSafePayloadErrorMessage } from "@/utils/safeErrorMessage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendApiBaseUrl = () => {
  const origin = getPublicApiOrigin() || "http://127.0.0.1:8000";

  return `${origin.replace(/\/$/, "")}/api`;
};

export const GET = async () => {
  try {
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
          success: false,
          message: getSafePayloadErrorMessage(
            payload,
            "Erro ao buscar categorias.",
          ),
          data: [],
        },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erro na API de categorias:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar categorias.",
        data: [],
      },
      { status: 500 },
    );
  }
};