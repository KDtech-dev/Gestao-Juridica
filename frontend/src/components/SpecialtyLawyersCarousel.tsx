"use client";

import { useRef } from "react";
import { Box, IconButton, Stack, Typography, Avatar } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useTranslations } from "next-intl";
import { LawyerCardType } from "@/@core/types";

type Props = {
  translations: ReturnType<typeof useTranslations>;
  title: string;
  lawyers: LawyerCardType[];
};

export default function SpecialtyLawyersCarousel({
  translations,
  title,
  lawyers,
}: Props) {
  const t = translations;
  const scrollRef = useRef<HTMLDivElement>(null);

  const showArrows = lawyers.length > 3;

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <Box mt={5}>
      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          pt: 4,
        }}
      >
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={4}>
          {title}
        </Typography>

        {lawyers.length === 0 ? (
          <Typography color="text.secondary" textAlign="center">
            {t("specialities.errorNoLawyersForSpecialty")}
          </Typography>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={showArrows ? "flex-start" : "center"}
            spacing={1}
          >
            {showArrows && (
              <IconButton
                onClick={() => scrollBy("left")}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  flexShrink: 0,
                }}
                aria-label={t("specialities.previous")}
              >
                <Icon icon="mdi:chevron-left" width={28} />
              </IconButton>
            )}

            <Box
              ref={scrollRef}
              sx={{
                display: "flex",
                gap: 3,
                overflowX: showArrows ? "auto" : "visible",
                scrollSnapType: showArrows ? "x mandatory" : "none",
                px: 1,
                py: 1,
                flex: showArrows ? 1 : "0 1 auto",
                justifyContent: showArrows ? "flex-start" : "center",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {lawyers.map((lawyer) => (
                <Box
                  key={lawyer.id}
                  sx={{
                    scrollSnapAlign: showArrows ? "start" : "unset",
                    flex: showArrows
                      ? {
                        xs: "0 0 85%",
                        sm: "0 0 45%",
                        md: "0 0 30%",
                      }
                      : "0 0 auto",
                    width: showArrows ? undefined : { xs: "85%", sm: 320 },
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Stack alignItems="center" spacing={1.5}>
                    <Avatar
                      src={lawyer.image}
                      alt={lawyer.name}
                      sx={{ width: 90, height: 90 }}
                    />
                    <Typography fontWeight={700} fontSize="1.05rem">
                      {lawyer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lawyer.role}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {lawyer.oab}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 260 }}
                    >
                      {lawyer.description}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>

            {showArrows && (
              <IconButton
                onClick={() => scrollBy("right")}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  flexShrink: 0,
                }}
                aria-label={t("specialities.next")}
              >
                <Icon icon="mdi:chevron-right" width={28} />
              </IconButton>
            )}
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          mt: 5,
        }}
      />
    </Box>
  );
}