"use client";

import { useEffect, useState } from "react";
import { Box, ButtonBase, CircularProgress, Popover, Tooltip, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { getAvailableProfileColors } from "@/api/ApiUsers";
import { PROFILE_COLORS, profileColorName } from "@/constants/profileColors";

type Props = {
  name: string;
  defaultColor?: string;
  scope?: "profile" | "users";
  excludeUserId?: string;
  textColor?: string;
};

const PickColor = ({
  name,
  defaultColor = PROFILE_COLORS[0],
  scope = "profile",
  excludeUserId,
  textColor = "#fff",
}: Props) => {
  const { watch, setValue, getValues } = useFormContext();
  const locale = useLocale() as "pt" | "en" | "es";
  const t = useTranslations("internal.profile.colorPicker");
  const watchedColor = watch(name) as string | null | undefined;
  const [colors, setColors] = useState<string[]>([...PROFILE_COLORS]);
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAvailableProfileColors(scope, excludeUserId)
      .then(({ colors: availableColors, used }) => {
        if (!active) return;
        setColors(availableColors);
        setUsedColors(used.map((color) => color.toLowerCase()));

        const currentValue = getValues(name) as string | null | undefined;
        const current = (currentValue || defaultColor).toLowerCase();
        const currentIsAvailable = availableColors.some(
          (color) => color.toLowerCase() === current,
        );
        const currentIsUsed = used.some(
          (color) => color.toLowerCase() === current,
        );
        if (!currentIsAvailable || currentIsUsed) {
          const firstAvailable = availableColors.find(
            (color) => !used.some((usedColor) => usedColor.toLowerCase() === color.toLowerCase()),
          );
          if (firstAvailable) setValue(name, firstAvailable, { shouldDirty: Boolean(currentValue) });
        }
      })
      .catch(() => {
        if (!active) return;
        setColors([]);
        setUsedColors([...PROFILE_COLORS]);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [excludeUserId, getValues, name, scope, setValue]);

  const colorCode = watchedColor || defaultColor;
  const colorName = profileColorName(colorCode, locale);
  const handleSelect = (color: string) => {
    setValue(name, color, { shouldDirty: true, shouldValidate: true });
    setAnchor(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={t("choose")}>
          <span>
            <ButtonBase
              aria-label={t("choose")}
              disabled={loading}
              onClick={(event) => setAnchor(event.currentTarget)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: colorCode.toLowerCase() === "#ffffff" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.8)",
                bgcolor: colorCode,
                boxShadow: 1,
              }}
            >
              {loading && <CircularProgress size={16} sx={{ color: textColor }} />}
            </ButtonBase>
          </span>
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ color: textColor, fontSize: "0.7rem", letterSpacing: 1 }}
        >
          {colorName}
        </Typography>
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 1.5, borderRadius: 2 } } }}
      >
        {colors.every((color) => usedColors.includes(color.toLowerCase())) ? (
          <Typography variant="body2" sx={{ maxWidth: 220 }}>
            {t("noneAvailable")}
          </Typography>
        ) : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(110px, 1fr))", gap: 0.75 }}>
          {colors.map((color) => {
            const unavailable = usedColors.includes(color.toLowerCase());
            return (
              <Tooltip key={color} title={unavailable ? t("inUse") : ""}>
                <span>
                  <ButtonBase
                    aria-label={`${profileColorName(color, locale)}${unavailable ? `, ${t("inUse")}` : ""}`}
                    disabled={unavailable}
                    onClick={() => handleSelect(color)}
                    sx={{
                      width: "100%",
                      minHeight: 36,
                      justifyContent: "flex-start",
                      gap: 1,
                      px: 1,
                      borderRadius: 1,
                      opacity: unavailable ? 0.28 : 1,
                      bgcolor: color.toLowerCase() === colorCode.toLowerCase() ? "action.selected" : "transparent",
                      border: 1,
                      borderColor: color.toLowerCase() === colorCode.toLowerCase() ? "primary.main" : "transparent",
                    }}
                  >
                    <Box sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", bgcolor: color, border: color.toLowerCase() === "#ffffff" ? "1px solid rgba(0,0,0,0.3)" : "none" }} />
                    <Typography variant="body2" noWrap>{profileColorName(color, locale)}</Typography>
                  </ButtonBase>
                </span>
              </Tooltip>
            );
          })}
        </Box>}
      </Popover>
    </>
  );
};

export default PickColor;
