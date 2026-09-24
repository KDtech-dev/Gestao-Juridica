"use client";

import type { ElementType } from "react";
import { Button, type ButtonProps } from "@mui/material";
import { Icon } from "@/components/AppIcon";

type Props = ButtonProps & {
  component?: ElementType;
  href?: string;
};

export function AddButton({ sx, children, ...props }: Props) {
  return (
    <Button
      variant="contained"
      startIcon={<Icon icon="mdi:plus" width={20} />}
      sx={[
        {
          borderRadius: "14px",
          px: 2.5,
          height: 44,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: (theme) => theme.shadows[2],
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: (theme) => theme.shadows[4],
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Button>
  );
}