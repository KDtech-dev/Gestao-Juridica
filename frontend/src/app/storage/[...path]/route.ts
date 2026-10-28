import { getPublicApiOrigin } from "@/configs/apiUrl";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getStorageOrigin = () =>
  (getPublicApiOrigin() || "http://127.0.0.1:8000").replace(/\/$/, "");

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await params;
  if (["casos", "compromissos"].includes(path[0] ?? "")) {
    return new NextResponse(null, { status: 404 });
  }

  const response = await fetch(
    `${getStorageOrigin()}/storage/${path.map(encodeURIComponent).join("/")}`,
    { cache: "no-store" },
  );

  if (!response.ok || !response.body) {
    return new NextResponse(null, { status: response.status || 404 });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  headers.set("Content-Disposition", "inline");

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
};
