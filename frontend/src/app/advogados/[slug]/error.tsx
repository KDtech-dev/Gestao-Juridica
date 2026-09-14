"use client";

import LawyerStatus from "@/views/AdvogadoPublico/Status";

export default function Error({ reset }: { reset: () => void }) {
  return <LawyerStatus retry={reset} />;
}
