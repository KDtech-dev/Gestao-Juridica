"use client";

import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postLogin } from "@/api/apiAuth";
import { handleRequest } from "@/configs/handleRequest";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getRouteByRole } from "@/utils/redirectByRole";
import { formatToastErrorMessage, toast } from "@/utils/toast";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/AppIcon";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { LoginInput, loginSchema } from "@/schemas/LoginSchema";

const languageOptions: Record<
  Language,
  { shortLabel: string; labelKey: "portuguese" | "english" | "spanish" }
> = {
  pt: { shortLabel: "PT", labelKey: "portuguese" },
  en: { shortLabel: "EN", labelKey: "english" },
  es: { shortLabel: "ES", labelKey: "spanish" },
};

export default function LoginView() {
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("validation");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const {
    isAuthenticated,
    loading: authLoading,
    redirectByRole,
    setAuth,
  } = useAuth();
  const headerT = useTranslations("public.header");
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languageOptions[language];
  const languageLabel = headerT(`language.${currentLanguage.labelKey}`);
  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setLanguage(event.target.value as Language);
  };
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema(tValidation)),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });
  const { ref: passwordFieldRef, ...passwordField } = register("password");

  const handleLogin = async (formData: LoginInput) => {
    if (loading) return;
    setLoading(true);

    const { data, error } = await handleRequest(() => postLogin(formData));

    if (error || !data) {
      toast.error(formatToastErrorMessage(error, t("error")));
      setLoading(false);
      return;
    }

    const roles: string[] = Array.isArray(data.user?.roles)
      ? data.user.roles
      : Object.values(data.user?.roles ?? {});

    const route = getRouteByRole(roles);

    setAuth(data.user, data.token, formData.remember);
    router.replace(route || "/agenda");
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      redirectByRole();
    }
  }, [authLoading, isAuthenticated, redirectByRole]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.05fr" },
        bgcolor: "background.default",
      }}
    >
      <Select<Language>
        value={language}
        size="small"
        displayEmpty
        aria-label={languageLabel}
        onChange={handleLanguageChange}
        renderValue={(selected) => (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            component="span"
          >
            <Icon icon="mdi:translate" width={18} />
            <Box component="span" sx={{ fontSize: "0.72rem", fontWeight: 800 }}>
              {languageOptions[selected].shortLabel}
            </Box>
          </Stack>
        )}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1,
              minWidth: 148,
              bgcolor: "#070b14",
              color: "#d7dce5",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              borderRadius: 0.75,
              boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
            },
          },
          MenuListProps: {
            dense: true,
            sx: { py: 0.5 },
          },
        }}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 2,
          minWidth: 76,
          height: 40,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          color: "text.primary",
          ".MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: 0,
            pl: 1,
            pr: 3,
          },
          ".MuiOutlinedInput-notchedOutline": {
            border: 0,
          },
          ".MuiSelect-icon": {
            color: "text.secondary",
            right: 6,
          },
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {Object.entries(languageOptions).map(([value, option]) => (
          <MenuItem
            key={value}
            value={value}
            sx={{
              minHeight: 34,
              fontSize: "0.86rem",
              "&.Mui-selected": {
                bgcolor: "rgba(59, 130, 246, 0.18)",
              },
              "&.Mui-selected:hover, &:hover": {
                bgcolor: "rgba(59, 130, 246, 0.24)",
              },
            }}
          >
            {headerT(`language.${option.labelKey}`)}
          </MenuItem>
        ))}
      </Select>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 5,
          color: "#fff",
          background:
            "linear-gradient(145deg, #0a1834 0%, #122a5f 60%, #1f46b6 100%)",
        }}
      >
        <Typography fontSize="1.08rem" fontWeight={700}>
          {t("brand")}
        </Typography>

        <Box>
          <Typography fontSize="2rem" fontWeight={700} mb={1.2}>
            {t("heroTitle")}
          </Typography>
          <Typography sx={{ maxWidth: 420, opacity: 0.9 }}>
            {t("heroText")}
          </Typography>
        </Box>

        <Typography sx={{ opacity: 0.75 }} fontSize="0.86rem">
          {t("rights")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 430,
            p: 3,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            bgcolor: "background.paper",
          }}
        >
          <Box component="form" onSubmit={handleSubmit(handleLogin)}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  fontSize="1.35rem"
                  fontWeight={700}
                  color="text.primary"
                >
                  {t("title")}
                </Typography>
                <Typography color="text.secondary" fontSize="0.88rem">
                  {t("subtitle")}
                </Typography>
              </Box>

              <TextField
                label={t("identifier")}
                fullWidth
                {...register("identifier")}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  passwordRef.current?.focus();
                }}
                disabled={loading}
                error={!!errors.identifier}
                helperText={errors.identifier?.message}
              />

              <TextField
                label={t("password")}
                type={showPassword ? "text" : "password"}
                fullWidth
                {...passwordField}
                inputRef={(element) => {
                  passwordFieldRef(element);
                  passwordRef.current = element;
                }}
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityAdornment
                      visible={showPassword}
                      onToggle={() => setShowPassword((visible) => !visible)}
                      disabled={loading}
                    />
                  ),
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
              >
                <Controller
                  name="remember"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onBlur={field.onBlur}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                          inputRef={field.ref}
                          disabled={loading}
                          size="small"
                        />
                      }
                      label={t("remember")}
                      sx={{
                        color: "text.secondary",
                        m: 0,
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.82rem",
                        },
                      }}
                    />
                  )}
                />
                <Button
                  component={Link}
                  href="/forgot-password"
                  sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
                >
                  <Typography fontSize="0.82rem" color="#2563eb">
                    {t("forgot")}
                  </Typography>
                </Button>
              </Stack>

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  py: 1.1,
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={18} color="inherit" />
                    <span>{t("loading")}</span>
                  </Box>
                ) : (
                  t("button")
                )}
              </Button>

              <Divider />

              <a
                href="/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Typography
                  textAlign="center"
                  fontSize="0.86rem"
                  sx={{
                    textDecoration: "none",
                    color: "text.secondary",
                  }}
                >
                  {t("back")}
                </Typography>
              </a>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
