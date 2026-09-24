import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { CompromissoVisao } from "@/api/apiCompromissos";
import { useTranslation } from "@/hooks/useTranslation";
import { formatTime } from "@/utils/compromisso";
import { SummaryStat } from "./Summarystat";
import { CardPaper } from "./Cardpaper";
import { AgendaPeriod, AgendaSummaryData } from "@/@core/types";


const PERIODS: AgendaPeriod[] = ["today", "week", "month"];

interface AgendaSummaryProps {
  period: AgendaPeriod;
  onPeriodChange: (period: AgendaPeriod) => void;
  visao: CompromissoVisao;
  summary: AgendaSummaryData;
}

export function AgendaSummary({
  period,
  onPeriodChange,
  visao,
  summary,
}: AgendaSummaryProps) {
  const { t } = useTranslation();

  return (
    <CardPaper sx={{ p: 2.2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
      >
        <Box>
          <Typography fontWeight={700} fontSize="1.15rem" color="text.primary">
            {t(`agenda.periods.${period}`)}
          </Typography>
          <Typography color="text.secondary" fontSize="0.86rem">
            {visao === "pessoal"
              ? t("agenda.summary.personalDescription")
              : t("agenda.summary.publicDescription")}
          </Typography>
        </Box>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={period}
          onChange={(_, value: AgendaPeriod | null) => {
            if (value) onPeriodChange(value);
          }}
          sx={{ "& .MuiToggleButton-root": { textTransform: "none", px: 1.6 } }}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p} value={p}>
              {t(`agenda.periods.${p}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
          mt: 2,
        }}
      >
        <SummaryStat value={summary.total} label={t("agenda.summary.total")} />
        <SummaryStat
          value={summary.finished}
          label={t("agenda.summary.completed")}
          color="success.main"
        />
        <SummaryStat
          value={summary.pending}
          label={t("agenda.summary.pending")}
          color="warning.dark"
        />
        <SummaryStat
          centered={false}
          noWrap
          value={
            summary.next
              ? `${formatTime(summary.next)} - ${summary.next.titulo}`
              : t("agenda.summary.noNext")
          }
          label={t("agenda.summary.nextAppointment")}
        />
      </Box>
    </CardPaper>
  );
}