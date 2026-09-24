import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ApiValidationError = {
  response?: { status?: number; data?: { errors?: Record<string, string[]> } };
};

const LARAVEL_RULES: [RegExp, string][] = [
  [/already been taken/i, "unique"],
  [/at least one (letter|number)/i, "complexity"],
  [/confirmation does not match/i, "same"],
  [/valid email/i, "invalid"],
  [/must be at least/i, "min"],
  [/greater than|may not be/i, "max"],
  [/is required|field is required/i, "required"],
];

export function detectRule(message: string): string | null {
  return LARAVEL_RULES.find(([re]) => re.test(message))?.[1] ?? null;
}

export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  translate?: (message: string, field: string) => string,
): boolean {
  const e = err as ApiValidationError;
  const errors = e?.response?.data?.errors;
  if (e?.response?.status !== 422 || !errors) return false;

  Object.entries(errors).forEach(([field, messages], index) => {
    const message = messages[0] ?? "";
    setError(
      field as Path<T>,
      { type: "server", message: translate ? translate(message, field) : message },
      { shouldFocus: index === 0 },
    );
  });

  return true;
}