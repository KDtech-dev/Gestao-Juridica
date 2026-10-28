import { Box, Chip, Stack, Typography } from "@mui/material";
import { AddButton } from "@/components/AddButton";
import { useTranslation } from "@/hooks/useTranslation";

interface AgendaHeaderProps {
  isToday: boolean;
  onNew: () => void;
  canCreate: boolean;
}

export function AgendaHeader({ isToday, onNew, canCreate }: AgendaHeaderProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      gap={2}
      mb={2.2}
    >
      <Box>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {t("agenda.title")}
          </Typography>
          {isToday && (
            <Chip
              size="small"
              label={t("agenda.today")}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography color="text.secondary" fontSize="0.85rem">
          {t("agenda.subtitle")}
        </Typography>
      </Box>

      {canCreate && <AddButton onClick={onNew}>{t("agenda.newAppointment")}</AddButton>}
    </Stack>
  );
}
