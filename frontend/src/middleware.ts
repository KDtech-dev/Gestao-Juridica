import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const validLanguages = ["pt", "en", "es"];

export function middleware(request: NextRequest) {
  const locale = request.cookies.get("idioma")?.value;
  const validLocale = locale && validLanguages.includes(locale) ? locale : "pt";

  const response = NextResponse.next();
  response.headers.set("x-locale", validLocale);
  return response;
}
