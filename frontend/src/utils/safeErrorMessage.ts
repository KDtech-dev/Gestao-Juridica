const UNSAFE_ERROR_PATTERNS = [
  /\bSQLSTATE\b/i,
  /\b(QueryException|PDOException)\b/i,
  /\b(Connection:\s*[^,]+,\s*SQL:|SQL:\s*)/i,
  /\b(select|insert|update|delete)\s+.+\b(from|into|set|where)\b/i,
  /\bintegrity constraint violation\b/i,
];

export function sanitizeApiErrorMessage(
  message: unknown,
  fallbackMessage: string,
) {
  if (typeof message !== "string") return fallbackMessage;

  const normalizedMessage = message.trim();

  if (!normalizedMessage) return fallbackMessage;

  const hasUnsafeDetails = UNSAFE_ERROR_PATTERNS.some((pattern) =>
    pattern.test(normalizedMessage),
  );

  return hasUnsafeDetails ? fallbackMessage : normalizedMessage;
}

export function getSafePayloadErrorMessage(
  payload: unknown,
  fallbackMessage: string,
) {
  if (!payload || typeof payload !== "object") return fallbackMessage;

  const errorPayload = payload as {
    message?: unknown;
    errors?: Record<string, unknown>;
  };
  const firstFieldError = errorPayload.errors
    ? Object.values(errorPayload.errors)[0]
    : undefined;
  const fieldMessage = Array.isArray(firstFieldError)
    ? firstFieldError[0]
    : firstFieldError;

  return sanitizeApiErrorMessage(
    fieldMessage || errorPayload.message,
    fallbackMessage,
  );
}
