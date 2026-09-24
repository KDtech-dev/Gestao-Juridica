import { IconButton, Tooltip } from "@mui/material";
import { Icon } from "@/components/AppIcon";

interface ActionIconButtonProps {
  tooltip: string;
  label: string;
  icon: string;
  onClick: () => void;
  color?: "default" | "error";
  compact?: boolean;
}

export function ActionIconButton({
  tooltip,
  label,
  icon,
  onClick,
  color = "default",
  compact = false,
}: ActionIconButtonProps) {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        size="small"
        aria-label={label}
        color={color}
        onClick={onClick}
        sx={
          compact
            ? { width: 28, height: 28 }
            : { border: "1px solid", borderColor: "divider" }
        }
      >
        <Icon icon={icon} width={compact ? 16 : 18} />
      </IconButton>
    </Tooltip>
  );
}