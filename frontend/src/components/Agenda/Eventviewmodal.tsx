import type { ReactNode } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import type { Compromisso } from "@/api/apiCompromissos";
import { Icon } from "@/components/AppIcon";
import { BaseModal } from "@/components/modals/BaseModal";
import { useTranslation } from "@/hooks/useTranslation";
import {
  compromissoDate,
  formatTime,
  statusChip,
  tipoIcon,
  tipoLabel,
} from "@/utils/compromisso";

interface EventViewModalProps {
  open: boolean;
  event: Compromisso | null;
  onClose: () => void;
  onEdit: (event: Compromisso) => void;
  canEdit: boolean;
}

function InfoRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Icon icon={icon} width={18} />
      <Typography fontSize="0.9rem">{children}</Typography>
    </Stack>
  );
}

export function EventViewModal({ open, event, onClose, onEdit, canEdit }: EventViewModalProps) {
  const { t, language } = useTranslation();

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t("agenda.viewModal.title")}
      confirmText={t("agenda.actions.edit")}
      cancelText={t("agenda.actions.close")}
      hideConfirm={!canEdit}
      maxWidth="sm"
      onSubmit={() => {
        if (event) onEdit(event);
      }}
    >
      {event && (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" gap={1.2}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <Icon icon={tipoIcon(event.tipo)} width={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} color="text.primary">
                {event.titulo}
              </Typography>
              <Typography fontSize="0.86rem" color="text.secondary">
                {tipoLabel(event.tipo, t)}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1.2}>
            <InfoRow icon="mdi:clock-outline">
              {compromissoDate(event).toLocaleDateString(language)}{" "}
              {t("agenda.viewModal.at")} {formatTime(event)}
            </InfoRow>
            <InfoRow icon="mdi:account-outline">
              {event.criador.nome || t("agenda.creatorUnknown")}
            </InfoRow>
            <InfoRow icon="mdi:flag-outline">
              {statusChip(event.status, t).label}
            </InfoRow>
          </Stack>

          {event.descricao && (
            <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "action.hover" }}>
              <Typography color="text.secondary" fontSize="0.9rem">
                {event.descricao}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </BaseModal>
  );
}
