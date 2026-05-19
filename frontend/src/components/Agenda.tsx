"use client";

import { Box, Typography, Stack, Button } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useRouter } from "next/navigation";

interface Item {
  time: string;
  client: string;
  description: string;
}

export function TodayAgenda({ items }: { items: Item[] }) {
  const router = useRouter();

  const handleItemClick = (time: string) => {
    router.push(`/agenda?time=${encodeURIComponent(time)}`);
  };

  const now = new Date();
  const nowHour = String(now.getHours()).padStart(2, "0");

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
        width: "100%",
        maxWidth: 320,
      }}
    >
      <Typography fontWeight={700} mb={2} color="text.primary">
        Agenda de Hoje
      </Typography>

      <Stack spacing={2}>
        {items.map((item, i) => {
          const isCurrentHour = item.time.startsWith(nowHour);

          return (
            <Box
              key={i}
              onClick={() => handleItemClick(item.time)}
              sx={{
                cursor: "pointer",
                p: 1.1,
                borderRadius: 1.2,
                bgcolor: isCurrentHour ? "primary.main" : "transparent",
                color: isCurrentHour ? "#fff" : "text.primary",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography fontWeight={700} fontSize="0.98rem">
                    {item.time}
                  </Typography>
                  <Typography fontSize="0.88rem" sx={{ opacity: 0.95 }}>
                    {item.client}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={
                      isCurrentHour
                        ? "rgba(255,255,255,0.85)"
                        : "text.secondary"
                    }
                  >
                    {item.description}
                  </Typography>
                </Box>

                <Icon icon="mdi:chevron-right" width={18} />
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          variant="text"
          onClick={() => router.push("/agenda")}
          sx={{ textTransform: "none" }}
        >
          Ver agenda completa
        </Button>
      </Box>
    </Box>
  );
}
