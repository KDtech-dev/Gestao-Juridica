type ApiOriginOptions = {
  /**
   * Quando o frontend está sendo acessado via um domínio público (ex: Dev Tunnel),
   * não faz sentido o browser tentar chamar um backend em `localhost/127.0.0.1`.
   * Nesse caso, retornamos string vazia para forçar uso de rotas relativas (`/api`)
   * e depender do proxy/rewrites do Next.
   */
  ignoreLocalhostFromBrowser?: boolean;
};

const normalizeOrigin = (value: string): string =>
  value.trim().replace(/\/$/, "");

const isLocalhostOrigin = (value: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);

const isLocalhostFrontend = (): boolean => {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1";
};

export const getPublicApiOrigin = (opts: ApiOriginOptions = {}): string => {
  const raw =
    process.env.EXPO_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

  const origin = normalizeOrigin(raw);
  if (!origin) return "";

  if (
    typeof window !== "undefined" &&
    (opts.ignoreLocalhostFromBrowser ?? true) &&
    isLocalhostOrigin(origin) &&
    !isLocalhostFrontend()
  ) {
    return "";
  }

  return origin;
};
