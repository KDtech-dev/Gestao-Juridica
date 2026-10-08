type ApiOriginOptions = {
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
