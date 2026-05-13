"use client";

import { useEffect } from "react";
import ErrorScreenTemplate from "@/components/ErrorScreenTemplate";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Falha ao renderizar a tela.", {
      digest: error.digest,
    });
  }, [error]);

  return <ErrorScreenTemplate onAction={reset} />;
}
