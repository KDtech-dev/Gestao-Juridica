"use client";

import dynamic from "next/dynamic";
import { Button } from "@mui/material";

const Icon = dynamic(
  () => import("@/components/AppIcon").then((mod) => mod.Icon),
  { ssr: false },
);

export function DownloadButton({ url, label }: { url: string; label: string }) {
  return (
    <Button
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variant="outlined"
      size="small"
      startIcon={<Icon icon="mdi:download" />}
      sx={{ textTransform: "none", borderColor: "divider" }}
    >
      {label}
    </Button>
  );
}
