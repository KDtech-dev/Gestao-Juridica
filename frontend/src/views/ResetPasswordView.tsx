"use client";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { handleRequest } from "@/configs/handleRequest";
import { formatToastErrorMessage, toast } from "@/utils/toast";
import { resetPassword } from "@/api/apiResetPassword";

import { Icon } from "@/components/AppIcon";
import { useLanguage, type Language } from "@/context/LanguageContext";

import { useTranslations } from "next-intl";

const languageOptions: Record<
  Language,
  {
    shortLabel: string;
    labelKey: "portuguese" | "english" | "spanish";
  }
> = {
  pt: {
    shortLabel: "PT",
    labelKey: "portuguese",
  },
  en: {
    shortLabel: "EN",
    labelKey: "english",
  },
  es: {
    shortLabel: "ES",
    labelKey: "spanish",
  },
};

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations("auth.resetPassword");
  const tLogin = useTranslations("auth.login");
  const headerT = useTranslations("public.header");
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languageOptions[language];
  const languageLabel = headerT(`language.${currentLanguage.labelKey}`);
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setLanguage(event.target.value as Language);
  };

  const passwordsMatch = password === passwordConfirmation;

  const passwordIsValid = password.length >= 8;

  const canSubmit =
    !!token &&
    !!email &&
    !!password &&
    !!passwordConfirmation &&
    passwordsMatch &&
    passwordIsValid &&
    !loading;

  const handleSubmit = async () => {
    if (loading) return;

    if (!token || !email) {
      toast.error(t("invalidToken"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("validation.passwordMinLength"));
      return;
    }

    if (!passwordsMatch) {
      toast.error(t("validation.passwordMismatch"));
      return;
    }

    setLoading(true);

    const { error } = await handleRequest(() =>
      resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    );

    if (error) {
      toast.error(formatToastErrorMessage(error, t("error")));

      setLoading(false);
      return;
    }

    toast.success(t("success"));

    setPassword("");
    setPasswordConfirmation("");

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1.05fr",
        },
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

            <Box
              component="span"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
              }}
            >
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
            sx: {
              py: 0.5,
            },
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
          display: {
            xs: "none",
            md: "flex",
          },

          flexDirection: "column",
          justifyContent: "space-between",

          p: 5,

          color: "#fff",

          background:
            "linear-gradient(145deg, #0a1834 0%, #122a5f 60%, #1f46b6 100%)",
        }}
      >
        <Typography fontSize="1.08rem" fontWeight={700}>
          {tLogin("brand")}
        </Typography>

        <Box>
          <Typography fontSize="2rem" fontWeight={700} mb={1.2}>
            {t("title")}
          </Typography>

          <Typography
            sx={{
              maxWidth: 420,
              opacity: 0.9,
            }}
          >
            {t("subtitle")}
          </Typography>
        </Box>

        <Typography
          sx={{
            opacity: 0.75,
          }}
          fontSize="0.86rem"
        >
          {tLogin("rights")}
        </Typography>
      </Box>


      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          p: {
            xs: 2,
            md: 4,
          },
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
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
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
                label={t("email")}
                fullWidth
                type="email"
                value={email}
                disabled
              />


              <TextField
                label={t("password")}
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                error={password.length > 0 && !passwordIsValid}
                helperText={
                  password.length > 0 && !passwordIsValid
                    ? t("validation.passwordMinLength")
                    : ""
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPassword ? t("hidePassword") : t("showPassword")
                          }
                        >
                          <Icon
                            icon={
                              showPassword
                                ? "mdi:eye-off-outline"
                                : "mdi:eye-outline"
                            }
                            width={20}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Confirmar nova senha */}

              <TextField
                label={t("passwordConfirmation")}
                fullWidth
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                error={passwordConfirmation.length > 0 && !passwordsMatch}
                helperText={
                  passwordConfirmation.length > 0 && !passwordsMatch
                    ? t("validation.passwordMismatch")
                    : ""
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswordConfirmation((prev) => !prev)
                          }
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPasswordConfirmation
                              ? t("hidePassword")
                              : t("showPassword")
                          }
                        >
                          <Icon
                            icon={
                              showPasswordConfirmation
                                ? "mdi:eye-off-outline"
                                : "mdi:eye-outline"
                            }
                            width={20}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Botão */}

              <Button
                variant="contained"
                type="submit"
                disabled={!canSubmit}
                sx={{
                  py: 1.1,
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                }}
              >
                {loading ? t("loading") : t("submit")}
              </Button>

              <Box
                component="button"
                type="button"
                onClick={() => router.push("/login")}
                disabled={loading}
                sx={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "text.secondary",
                  fontSize: "0.86rem",
                  py: 0.5,

                  "&:disabled": {
                    cursor: "default",
                  },

                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {t("back")}
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
