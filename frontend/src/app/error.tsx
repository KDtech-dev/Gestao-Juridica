"use client";

import ErrorScreen from "@/components/errors/ErrorScreen";

export default function ApplicationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen mode="application" onRetry={reset} />;
}
