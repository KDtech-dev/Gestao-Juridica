import { memo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Compromisso } from "@/api/apiCompromissos";
import { Icon } from "@/components/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import {
  compromissoDate,
  formatTime,
  statusChip,
  tipoIcon,
  tipoLabel,
} from "@/utils/compromisso";
import { ActionIconButton } from "./ActionIconButton";

interface TimelineItemProps {
  event: Compromisso;
  isLast: boolean;
  highlighted: boolean;
  onView: (event: Compromisso) => void;
  onEdit: (event: Compromisso) => void;
  onDelete: (event: Compromisso) => void;
}

export const TimelineItem = memo(function TimelineItem({
  event,
  isLast,
  highlighted,
  onView,
  onEdit,
  onDelete,
}: TimelineItemProps) {
  const { t, language } = useTranslation();
  const chip = statusChip(event.status, t);

  return (
    <Box
      data-event-id={event.id}
      onClick={() => onView(event)}
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        p: 1.4,
        mb: isLast ? 0 : 1,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        cursor: "pointer",
        bgcolor: highlighted
          ? (theme) => alpha(theme.palette.primary.main, 0.06)
          : "background.paper",
        boxShadow: highlighted
          ? (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.1)}`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transition:
          "background-color .12s, border-color .12s, box-shadow .12s, transform .12s",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "primary.light",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            bgcolor: highlighted ? "primary.main" : "divider",
            color: highlighted ? "primary.contrastText" : "text.secondary",
            boxShadow: highlighted
              ? (theme) => `0 8px 18px ${alpha(theme.palette.primary.main, 0.22)}`
              : "none",
          }}
        >
          <Icon icon={tipoIcon(event.tipo)} width={18} />
        </Box>
        {!isLast && <Box sx={{ width: 2, height: 48, bgcolor: "divider", mt: 0.8 }} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1}
        >
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography fontWeight={800} color="text.primary" fontSize="1.05rem">
              {formatTime(event)}
            </Typography>
            <Chip
              size="small"
              label={chip.label}
              sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" gap={0.5} onClick={(e) => e.stopPropagation()}>
            <ActionIconButton
              tooltip={t("agenda.actions.view")}
              label={t("agenda.actions.viewAppointment")}
              icon="mdi:eye-outline"
              onClick={() => onView(event)}
            />
            <ActionIconButton
              tooltip={t("agenda.actions.edit")}
              label={t("agenda.actions.editAppointment")}
              icon="mdi:pencil-outline"
              onClick={() => onEdit(event)}
            />
            <ActionIconButton
              tooltip={t("agenda.actions.delete")}
              label={t("agenda.actions.deleteAppointment")}
              icon="mdi:trash-can-outline"
              color="error"
              onClick={() => onDelete(event)}
            />
          </Stack>
        </Stack>

        <Typography fontWeight={700} color="text.primary" mt={0.5}>
          {event.titulo}
        </Typography>
        <Typography color="info.main" fontSize="0.86rem" mb={0.8}>
          {tipoLabel(event.tipo, t)}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 0.4, sm: 2 }}
          color="text.secondary"
        >
          <Stack direction="row" alignItems="center" gap={0.6}>
            <Icon icon="mdi:account-outline" width={16} />
            <Typography fontSize="0.83rem">
              {event.criador.nome || t("agenda.creatorUnknown")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.6}>
            <Icon icon="mdi:calendar" width={16} />
            <Typography fontSize="0.83rem">
              {compromissoDate(event).toLocaleDateString(language)}
            </Typography>
          </Stack>
        </Stack>

        {event.descricao && (
          <Typography color="text.secondary" fontSize="0.86rem" mt={0.8}>
            {event.descricao}
          </Typography>
        )}
      </Box>
    </Box>
  );
});