"use client";

import { useEffect, useState } from "react";
import { Box, ButtonBase, CircularProgress, Popover, Tooltip, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { getAvailableProfileColors } from "@/api/ApiUsers";
import { PROFILE_COLORS } from "@/constants/profileColors";

type Props = {
  name: string;
  defaultColor?: string;
  scope?: "profile" | "users";
  excludeUserId?: string;
};

const PickColor = ({
  name,
  defaultColor = PROFILE_COLORS[0],
  scope = "profile",
  excludeUserId,
}: Props) => {
  const { watch, setValue, getValues } = useFormContext();
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
                border: "2px solid rgba(255,255,255,0.8)",
                bgcolor: colorCode,
                boxShadow: 1,
              }}
            >
              {loading && <CircularProgress size={16} sx={{ color: "#fff" }} />}
            </ButtonBase>
          </span>
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem", letterSpacing: 1 }}
        >
          {colorCode.toUpperCase()}
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
        ) : <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 36px)", gap: 1 }}>
          {colors.map((color) => {
            const unavailable = usedColors.includes(color.toLowerCase());
            return (
              <Tooltip key={color} title={unavailable ? t("inUse") : color.toUpperCase()}>
                <span>
                  <ButtonBase
                    aria-label={`${color}${unavailable ? `, ${t("inUse")}` : ""}`}
                    disabled={unavailable}
                    onClick={() => handleSelect(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      opacity: unavailable ? 0.28 : 1,
                      border: color.toLowerCase() === colorCode.toLowerCase() ? "3px solid #fff" : "2px solid transparent",
                      outline: color.toLowerCase() === colorCode.toLowerCase() ? "2px solid" : "none",
                      outlineColor: "text.primary",
                      cursor: unavailable ? "not-allowed" : "pointer",
                    }}
                  />
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
