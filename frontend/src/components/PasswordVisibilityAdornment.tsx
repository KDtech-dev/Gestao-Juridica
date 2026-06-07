"use client";

import { Icon } from "@/components/AppIcon";
import { IconButton, InputAdornment } from "@mui/material";

type PasswordVisibilityAdornmentProps = {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  showLabel?: string;
  hideLabel?: string;
};

export default function PasswordVisibilityAdornment({
  visible,
  onToggle,
  disabled = false,
  showLabel = "Mostrar senha",
  hideLabel = "Ocultar senha",
}: PasswordVisibilityAdornmentProps) {
  const label = visible ? hideLabel : showLabel;

  return (
    <InputAdornment position="end">
      <IconButton
        type="button"
        aria-label={label}
        title={label}
        onClick={onToggle}
        onMouseDown={(event) => event.preventDefault()}
        disabled={disabled}
        edge="end"
      >
        <Icon
          icon={visible ? "mdi:eye-off-outline" : "mdi:eye-outline"}
          width={20}
        />
      </IconButton>
    </InputAdornment>
  );
}
