import { FormControl, MenuItem, Pagination, Select, Stack, Typography } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { PageSize } from "@/@core/types";

interface TimelinePaginationProps {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export function TimelinePagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TimelinePaginationProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={1.5}
      pt={2}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        justifyContent={{ xs: "space-between", sm: "flex-start" }}
      >
        <Typography color="text.secondary" fontSize="0.82rem">
          {t("agenda.timeline.perPage")}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 86 }}>
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          >
            <MenuItem value="5">5</MenuItem>
            <MenuItem value="10">10</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, next) => onPageChange(next)}
        color="primary"
        size="small"
        sx={{ alignSelf: { xs: "center", sm: "auto" } }}
      />
    </Stack>
  );
}