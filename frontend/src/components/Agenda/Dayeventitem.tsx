import { memo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Compromisso } from "@/api/apiCompromissos";
import { Icon } from "@/components/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { formatTime, statusChip, tipoIcon, tipoLabel } from "@/utils/compromisso";
import { ActionIconButton } from "./ActionIconButton";

interface DayEventItemProps {
  event: Compromisso;
  onView: (event: Compromisso) => void;
  onDelete: (event: Compromisso) => void;
}

export const DayEventItem = memo(function DayEventItem({
  event,
  onView,
  onDelete,
}: DayEventItemProps) {
  const { t } = useTranslation();
  const chip = statusChip(event.status, t);

  return (
    <Box
      onClick={() => onView(event)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        p: 1.15,
        cursor: "pointer",
        transition: "background-color .12s, border-color .12s, transform .12s",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "primary.light",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        <Icon icon={tipoIcon(event.tipo)} width={18} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography fontWeight={700} color="text.primary" noWrap>
            {event.titulo}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography color="text.secondary" fontSize="0.8rem" fontWeight={700}>
              {formatTime(event)}
            </Typography>
            <ActionIconButton
              compact
              tooltip={t("agenda.actions.delete")}
              label={t("agenda.actions.deleteAppointment")}
              icon="mdi:trash-can-outline"
              color="error"
              onClick={() => onDelete(event)}
            />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          mt={0.5}
        >
          <Typography color="text.secondary" fontSize="0.8rem">
            {tipoLabel(event.tipo, t)}
          </Typography>
          <Chip
            size="small"
            label={chip.label}
            sx={{
              height: 22,
              bgcolor: chip.bg,
              color: chip.color,
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
});