"use client";

import { ThemeMode, useThemeMode } from "@/theme/ThemeRegistry";
import { ThemeModeSelector } from "./ThemeModeSelector";
import { toast } from "@/utils/toast";

export function AccessibilitySettings() {
  const { themeMode, setThemeMode } = useThemeMode();

  const updateAndNotify = () => {
    toast.success("Preferência visual atualizada.");
  };
  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    updateAndNotify();
  };

  return (
    <ThemeModeSelector value={themeMode} onChange={handleThemeModeChange} />
  );
}
