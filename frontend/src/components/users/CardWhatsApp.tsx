"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import api from "@/configs/axios";
import { useAuth } from "@/hooks/useAuth";

type Preferences = {
  phone: string | null;
  verified_at: string | null;
  verification_mode: string | null;
  consented_at: string | null;
  daily_enabled: boolean;
  events_enabled: boolean;
  daily_time: string;
  timezone: string;
  locale: string;
  reminder_minutes: number[] | null;
};
type Configuration = {
  preferences: Preferences;
  enabled: boolean;
  mode: string;
  diagnostic_ready: boolean;
};
type Delivery = {
  state: string;
  occurred_at: string;
  error_code: string | null;
};
type Message = {
  id: string;
  user_id: string;
  phone: string;
  kind: string;
  mode: string;
  state: string;
  due_at: string;
  attempts: number;
  meta_id: string | null;
  error_code: string | null;
  deliveries: Delivery[];
};

export default function CardWhatsApp() {
  const t = useTranslations("whatsapp");
  const { hasRole } = useAuth();
  const admin = hasRole("admin");
  const lawyer = hasRole("advogado");
  const [config, setConfig] = useState<Configuration | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [consent, setConsent] = useState(false);
  const [minutes, setMinutes] = useState("1440, 60");
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [diagnosticPhone, setDiagnosticPhone] = useState("");

  const history = useCallback(async () => {
    const { data } = await api.get("/whatsapp/history", {
      params: { page, state: filter || undefined },
    });
    setMessages(data.data);
    setLastPage(data.last_page);
  }, [page, filter]);
  const load = useCallback(async () => {
    const { data } = await api.get<Configuration>("/whatsapp/preferences");
    setConfig(data);
    setPreferences(data.preferences);
    setConsent(Boolean(data.preferences.consented_at));
    setMinutes((data.preferences.reminder_minutes ?? [1440, 60]).join(", "));
  }, []);
  useEffect(() => {
    if (admin || lawyer) {
      void load().catch(() => setError(true));
    }
  }, [admin, lawyer, load]);
  useEffect(() => {
    if (admin || lawyer) {
      void history().catch(() => setError(true));
    }
  }, [admin, lawyer, history]);

  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError(false);
    setSaved(false);
    try {
      await fn();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  if (!admin && !lawyer) return null;
  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((p) => (p ? { ...p, [key]: value } : p));
  }
  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            {t("title")}
          </Typography>
          <Typography color="text.secondary">{t("description")}</Typography>
          {error && <Alert severity="error">{t("error")}</Alert>}
          {saved && <Alert severity="success">{t("saved")}</Alert>}
          {config && (
            <Stack direction="row" spacing={1}>
              <Chip label={t(`modes.${config.mode}`)} />
              <Chip label={t(config.enabled ? "enabled" : "disabled")} />
            </Stack>
          )}
          {lawyer && preferences && (
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                void action(async () => {
                  const offsets = minutes.trim()
                    ? minutes.split(",").map((s) => Number(s.trim()))
                    : [];
                  await api.put("/whatsapp/preferences", {
                    phone: preferences.phone,
                    consent,
                    daily_enabled: preferences.daily_enabled,
                    events_enabled: preferences.events_enabled,
                    daily_time: preferences.daily_time,
                    timezone: preferences.timezone,
                    locale: preferences.locale,
                    reminder_minutes: offsets,
                  });
                  setInstruction("");
                  await load();
                  setSaved(true);
                });
              }}
            >
              <Stack spacing={2}>
                <TextField
                  required
                  label={t("phone")}
                  value={preferences.phone ?? ""}
                  onChange={(e) => update("phone", e.target.value)}
                  helperText={t("phoneHelp")}
                  autoComplete="tel"
                />
                <Alert severity={preferences.verified_at ? "success" : "info"}>
                  {t(
                    preferences.verified_at
                      ? preferences.verification_mode === "simulation"
                        ? "simulatedVerification"
                        : "verified"
                      : "unverified",
                  )}
                </Alert>
                <FormControlLabel
                  control={
                    <Switch
                      checked={consent}
                      onChange={(_, value) => setConsent(value)}
                    />
                  }
                  label={t("consent")}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.daily_enabled}
                      onChange={(_, value) => update("daily_enabled", value)}
                    />
                  }
                  label={t("daily")}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.events_enabled}
                      onChange={(_, value) => update("events_enabled", value)}
                    />
                  }
                  label={t("events")}
                />
                <TextField
                  type="time"
                  label={t("dailyTime")}
                  required
                  value={preferences.daily_time}
                  onChange={(e) => update("daily_time", e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label={t("timezone")}
                  required
                  value={preferences.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                />
                <TextField
                  label={t("reminders")}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  helperText={t("remindersHelp")}
                />
                <TextField
                  select
                  label={t("language")}
                  value={preferences.locale}
                  onChange={(e) => update("locale", e.target.value)}
                >
                  <MenuItem value="pt">Português</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </TextField>
                <Button type="submit" variant="contained" disabled={busy}>
                  {t("save")}
                </Button>
                <Button
                  disabled={busy || !config?.preferences.phone}
                  onClick={() =>
                    void action(async () => {
                      const { data } = await api.post("/whatsapp/verification");
                      setInstruction(data.instruction);
                    })
                  }
                >
                  {t("verify")}
                </Button>
                {instruction && (
                  <Alert severity="info">
                    {t("verificationHelp")} <strong>{instruction}</strong>
                  </Alert>
                )}
                <Typography variant="body2">{t("stopHelp")}</Typography>
              </Stack>
            </Box>
          )}
          {admin && (
            <Stack spacing={2}>
              <Typography component="h3" variant="subtitle1">
                {t("diagnostic")}
              </Typography>
              <Typography variant="body2">{t("diagnosticHelp")}</Typography>
              <TextField
                label={t("phone")}
                value={diagnosticPhone}
                onChange={(e) => setDiagnosticPhone(e.target.value)}
              />
              <Button
                disabled={
                  busy ||
                  !diagnosticPhone ||
                  !(
                    config?.diagnostic_ready ||
                    (config?.enabled && config?.mode === "simulation")
                  )
                }
                onClick={() =>
                  void action(async () => {
                    await api.post("/whatsapp/diagnostic", {
                      phone: diagnosticPhone,
                    });
                    setSaved(true);
                    await history();
                  })
                }
              >
                {t(
                  config?.mode === "simulation"
                    ? "simulateDiagnostic"
                    : "sendDiagnostic",
                )}
              </Button>
            </Stack>
          )}
          <Typography component="h3" variant="subtitle1">
            {t("history")}
          </Typography>
          <TextField
            select
            label={t("filter")}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">{t("all")}</MenuItem>
            {[
              "pending",
              "processing",
              "accepted",
              "sent",
              "delivered",
              "read",
              "failed",
              "cancelled",
              "expired",
              "simulated",
              "indeterminate",
            ].map((state) => (
              <MenuItem key={state} value={state}>
                {t(`states.${state}`)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            disabled={busy}
            onClick={() =>
              void action(async () => {
                await load();
                await history();
              })
            }
          >
            {t("refresh")}
          </Button>
          {messages.length === 0 && (
            <Typography color="text.secondary">{t("empty")}</Typography>
          )}
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
            >
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
                <Chip
                  label={t(`states.${message.state}`)}
                  color={
                    message.state === "failed" ||
                    message.state === "indeterminate"
                      ? "warning"
                      : "default"
                  }
                />
                <Chip label={t(`modes.${message.mode}`)} />
                <Typography>
                  {t(`kinds.${message.kind}`)} · {message.phone}
                </Typography>
              </Stack>
              <Typography variant="body2">
                {new Date(message.due_at).toLocaleString()} ·{" "}
                {t("attempts", { count: message.attempts })}
              </Typography>
              {admin && (
                <Typography variant="caption" sx={{ overflowWrap: "anywhere" }}>
                  {t("recipient")}: {message.user_id}
                </Typography>
              )}
              {message.error_code && (
                <Typography variant="body2">
                  {t(
                    `errors.${message.error_code.startsWith("meta_") ? "meta" : message.error_code}`,
                  )}
                  {message.error_code.startsWith("meta_")
                    ? ` (${message.error_code})`
                    : ""}
                </Typography>
              )}
              {message.deliveries.length > 0 && (
                <Box component="details">
                  <summary>{t("deliveryHistory")}</summary>
                  {message.meta_id && (
                    <Typography
                      variant="caption"
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {message.meta_id}
                    </Typography>
                  )}
                  {message.deliveries.map((delivery, index) => (
                    <Typography variant="body2" key={index}>
                      {t(`states.${delivery.state}`)} ·{" "}
                      {new Date(delivery.occurred_at).toLocaleString()}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t("previous")}
            </Button>
            <Typography>
              {page} / {lastPage}
            </Typography>
            <Button
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
            >
              {t("next")}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
