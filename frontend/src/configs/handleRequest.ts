import { getApiErrorMessage } from "./ApiError";

export async function handleRequest<T>(
  fn: () => Promise<T>,
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: getApiErrorMessage(error) };
  }
}
