import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { Compromisso } from "@/api/apiCompromissos";
import { Icon } from "@/components/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { usePagination } from "@/hooks/usePagination";
import { useScrollToEventByTime } from "@/hooks/useScrollToEventByTime";
import { CardPaper } from "./Cardpaper";
import { TimelineItem } from "./Timelineitem";
import { TimelinePagination } from "./Timelinepagination";
import { isHappeningNow } from "@/hooks/Agenda";


interface AgendaTimelineProps {
  events: Compromisso[];
  loading: boolean;
  error: string | null;
  /** Muda quando visão/período mudam, para voltar à página 1. */
  resetKey: string;
  onView: (event: Compromisso) => void;
  onEdit: (event: Compromisso) => void;
  onDelete: (event: Compromisso) => void;
}

export function AgendaTimeline({
  events,
  loading,
  error,
  resetKey,
  onView,
  onEdit,
  onDelete,
}: AgendaTimelineProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const pagination = usePagination(events, { resetKey });
  const queryTime = useScrollToEventByTime(events, pagination.goToItem);

  const ready = !loading && !error;
  const now = new Date();

  return (
    <CardPaper sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Icon icon="mdi:calendar-clock" width={20} />
          <Typography fontWeight={700} fontSize="1.15rem" color="text.primary">
            {t("agenda.timeline.title")}
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="text"
          endIcon={<Icon icon="mdi:arrow-right" width={16} />}
          onClick={() => router.push("/compromissos")}
          sx={{ textTransform: "none" }}
        >
          {t("agenda.timeline.viewAll")}
        </Button>
      </Box>

      <Stack sx={{ p: 2 }} spacing={0}>
        {loading && (
          <Box sx={{ p: 2, display: "grid", gap: 1 }}>
            <Typography color="text.secondary" fontSize="0.9rem">
              {t("agenda.timeline.loading")}
            </Typography>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={72} />
            ))}
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {ready && events.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">{t("agenda.timeline.empty")}</Typography>
          </Box>
        )}

        {ready &&
          pagination.pageItems.map((event, idx) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={idx === pagination.pageItems.length - 1}
              highlighted={isHappeningNow(event, now, queryTime)}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

        {ready && events.length > 0 && (
          <TimelinePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
          />
        )}
      </Stack>
    </CardPaper>
  );
}