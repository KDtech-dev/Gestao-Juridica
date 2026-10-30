"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getAxios } from "@/configs/axios";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useTranslations } from "next-intl";
import { toast, formatToastErrorMessage } from "@/utils/toast";

type ConnectionState = {
  status: string;
  phone?: string | null;
  last_error?: string | null;
  qr_image?: string | null;
};

type ReminderMessageOptions = {
  incluir_nome: boolean;
  incluir_tipo: boolean;
  incluir_data: boolean;
  incluir_hora: boolean;
};

type WhatsAppMessageRecord = {
  id: string;
  titulo: string;
  responsavel: string | null;
  pode_reenviar: boolean;
  status: "pending" | "queued" | "sent" | "delivered" | "read" | "failed";
  erro: string | null;
  criada_em: string | null;
  entregue_em: string | null;
  lida_em: string | null;
};

function getData<T>(response: { data?: { data?: T } & T }): T {
  return (response.data?.data ?? response.data) as T;
}

function formatBrazilianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("55")) digits = digits.slice(2);

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const split = number.length > 8 ? number.length - 4 : Math.max(number.length - 4, 0);
  const formattedNumber = number.length > 4
    ? `${number.slice(0, split)}-${number.slice(split)}`
    : number;

  return digits.length >= 2 ? `+55 (${areaCode}) ${formattedNumber}` : `+55 ${digits}`;
}

export default function WhatsAppSettingsView() {
  const t = useTranslations("internal.whatsapp");
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState(t("defaultTestMessage"));
  const [reminderTime, setReminderTime] = useState("07:00");
  const [messageOptions, setMessageOptions] = useState<ReminderMessageOptions>({
    incluir_nome: true,
    incluir_tipo: true,
    incluir_data: true,
    incluir_hora: true,
  });
  const [loadingReminderTime, setLoadingReminderTime] = useState(true);
  const [savingReminderTime, setSavingReminderTime] = useState(false);
  const [messageRecords, setMessageRecords] = useState<WhatsAppMessageRecord[]>([]);
  const [loadingMessageRecords, setLoadingMessageRecords] = useState(true);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);

  const loadMessageRecords = useCallback(async (silent = false) => {
    try {
      const response = await getAxios().get("/admin/whatsapp/messages");
      setMessageRecords(getData<WhatsAppMessageRecord[]>(response));
    } catch (statusError) {
      if (!silent) {
        toast.error(formatToastErrorMessage(statusError, t("deliveryLoadError")));
      }
    } finally {
      setLoadingMessageRecords(false);
    }
  }, [t]);

  const retryMessage = async (id: string) => {
    setRetryingMessageId(id);
    try {
      await getAxios().post(`/admin/whatsapp/messages/${id}/retry`);
      toast.success(t("retryQueued"));
      await loadMessageRecords();
    } catch (retryError) {
      toast.error(formatToastErrorMessage(retryError, t("retryError")));
    } finally {
      setRetryingMessageId(null);
    }
  };

  const loadReminderTime = useCallback(async () => {
    try {
      const response = await getAxios().get("/admin/whatsapp/settings");
      const settings = getData<{
        horario_lembrete: string;
        mensagem: ReminderMessageOptions;
      }>(response);
      setReminderTime(settings.horario_lembrete);
      setMessageOptions(settings.mensagem);
    } catch (settingsError) {
      toast.error(formatToastErrorMessage(settingsError, t("scheduleLoadError")));
    } finally {
      setLoadingReminderTime(false);
    }
  }, [t]);

  const saveSettings = async () => {
    setSavingReminderTime(true);
    try {
      await getAxios().put("/admin/whatsapp/settings", {
        horario_lembrete: reminderTime,
        mensagem: messageOptions,
      });
      toast.success(t("settingsSaved"));
    } catch (settingsError) {
      toast.error(formatToastErrorMessage(settingsError, t("scheduleSaveError")));
    } finally {
      setSavingReminderTime(false);
    }
  };

  const previewMessage = [
    messageOptions.incluir_nome ? "Olá, Ana! " : "",
    "Lembrete: você tem ",
    messageOptions.incluir_tipo ? "uma audiência" : "um compromisso",
    " hoje",
    messageOptions.incluir_data ? ", 30/10/2026" : "",
    messageOptions.incluir_hora ? ", às 14:30" : "",
    ". Compromisso: Audiência inicial.",
  ].join("");

  const sendTestMessage = async () => {
    setSendingTest(true);
    try {
      await getAxios().post("/admin/whatsapp/test-message", {
        phone: `55${testPhone.replace(/\D/g, "")}`,
        message: testMessage,
      });
      toast.success(t("testSent"));
    } catch (sendError) {
      toast.error(formatToastErrorMessage(sendError, t("testFailed")));
    } finally {
      setSendingTest(false);
    }
  };

  const refresh = useCallback(async () => {
    try {
      const statusResponse = await getAxios().get("/admin/whatsapp/status");
      const current = getData<ConnectionState>(statusResponse);
      if (current.status !== "connected") {
        const qrResponse = await getAxios().get("/admin/whatsapp/qr");
        const qrData = getData<ConnectionState>(qrResponse);
        setConnection({ ...current, qr_image: qrData.qr_image });
      } else {
        setConnection(current);
      }
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void loadReminderTime();
    void loadMessageRecords();
    const timer = window.setInterval(() => void refresh(), 4000);
    const messageTimer = window.setInterval(() => void loadMessageRecords(true), 20000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(messageTimer);
    };
  }, [loadMessageRecords, loadReminderTime, refresh]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <SidebarDashboard activeKey="admin-whatsapp" />
      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {t("title")}
              </Typography>
              <Typography color="text.secondary" mt={0.6}>{t("subtitle")}</Typography>
            </Box>
            {error && <Alert severity="error">{t("serviceUnavailable")}</Alert>}
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {t("scheduleTitle")}
                  </Typography>
                  <Typography color="text.secondary" mt={0.5}>
                    {t("scheduleHelp")}
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                  <TextField
                    type="time"
                    label={t("scheduleTime")}
                    value={reminderTime}
                    onChange={(event) => setReminderTime(event.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled={loadingReminderTime || savingReminderTime}
                    sx={{ width: { sm: 180 } }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => void saveSettings()}
                    disabled={loadingReminderTime || savingReminderTime || !reminderTime}
                  >
                    {savingReminderTime ? t("settingsSaving") : t("saveSettings")}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {t("messageOptionsTitle")}
                  </Typography>
                  <Typography color="text.secondary" mt={0.5}>
                    {t("messageOptionsHelp")}
                  </Typography>
                </Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  flexWrap="wrap"
                  columnGap={3}
                  rowGap={0.5}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={messageOptions.incluir_nome}
                        onChange={(event) => setMessageOptions((current) => ({ ...current, incluir_nome: event.target.checked }))}
                        disabled={loadingReminderTime || savingReminderTime}
                      />
                    }
                    label={t("includeName")}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={messageOptions.incluir_tipo}
                        onChange={(event) => setMessageOptions((current) => ({ ...current, incluir_tipo: event.target.checked }))}
                        disabled={loadingReminderTime || savingReminderTime}
                      />
                    }
                    label={t("includeType")}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={messageOptions.incluir_data}
                        onChange={(event) => setMessageOptions((current) => ({ ...current, incluir_data: event.target.checked }))}
                        disabled={loadingReminderTime || savingReminderTime}
                      />
                    }
                    label={t("includeDate")}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={messageOptions.incluir_hora}
                        onChange={(event) => setMessageOptions((current) => ({ ...current, incluir_hora: event.target.checked }))}
                        disabled={loadingReminderTime || savingReminderTime}
                      />
                    }
                    label={t("includeAppointmentTime")}
                  />
                </Stack>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", maxWidth: 760 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    {t("messagePreview")}
                  </Typography>
                  <Typography>{previewMessage}</Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => void saveSettings()}
                  disabled={loadingReminderTime || savingReminderTime || !reminderTime}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {savingReminderTime ? t("settingsSaving") : t("saveSettings")}
                </Button>
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              {loading && !connection ? (
                <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                  <Typography>{t("loading")}</Typography>
                </Stack>
              ) : connection?.status === "connected" ? (
                <Stack spacing={2}>
                  <Alert severity="success">{t("connected")}</Alert>
                  {connection.phone && (
                    <TextField
                      label={t("phone")}
                      value={formatBrazilianPhone(connection.phone).replace(/^\+55\s*/, "")}
                      size="small"
                      disabled
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">+55</InputAdornment>,
                      }}
                      sx={{ maxWidth: 420 }}
                    />
                  )}
                  <TextField
                    label={t("testPhone")}
                    value={testPhone}
                    onChange={(event) => setTestPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder={t("testPhonePlaceholder")}
                    helperText={t("testPhoneHelp")}
                    autoComplete="tel"
                    inputMode="tel"
                    InputProps={{ startAdornment: <InputAdornment position="start">+55</InputAdornment> }}
                    sx={{ maxWidth: 420 }}
                  />
                  <TextField
                    label={t("testMessage")}
                    value={testMessage}
                    onChange={(event) => setTestMessage(event.target.value)}
                    multiline
                    minRows={3}
                    maxRows={8}
                    inputProps={{ maxLength: 4096 }}
                    helperText={t("testMessageHelp")}
                    sx={{ maxWidth: 640 }}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      variant="contained"
                      onClick={() => void sendTestMessage()}
                      disabled={sendingTest || testPhone.replace(/\D/g, "").length < 10 || !testMessage.trim()}
                    >
                      {sendingTest ? t("sendingTest") : t("sendTest")}
                    </Button>
                    <Button variant="outlined" onClick={() => void refresh()}>
                      {t("refresh")}
                    </Button>
                  </Stack>
                </Stack>
              ) : connection?.qr_image ? (
                <Stack alignItems="center" spacing={2}>
                  <Alert severity="info" sx={{ width: "100%" }}>{t("scanQr")}</Alert>
                  <Box
                    component="img"
                    src={connection.qr_image}
                    alt={t("qrAlt")}
                    sx={{ width: 280, height: 280, imageRendering: "pixelated" }}
                  />
                  <Typography color="text.secondary">{t("refreshingQr")}</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Alert severity="warning">{t("waitingQr")}</Alert>
                  {connection?.last_error && <Typography color="text.secondary">{connection.last_error}</Typography>}
                  <Button variant="outlined" onClick={() => void refresh()} sx={{ alignSelf: "flex-start" }}>
                    {t("refresh")}
                  </Button>
                </Stack>
              )}
            </Paper>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {t("deliveryTitle")}
                    </Typography>
                    <Typography color="text.secondary" mt={0.5}>
                      {t("deliveryHelp")}
                    </Typography>
                  </Box>
                  <Button variant="outlined" onClick={() => void loadMessageRecords()} disabled={loadingMessageRecords}>
                    {t("deliveryRefresh")}
                  </Button>
                </Stack>
                {loadingMessageRecords ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography color="text.secondary">{t("deliveryLoading")}</Typography>
                  </Stack>
                ) : messageRecords.length === 0 ? (
                  <Typography color="text.secondary">{t("deliveryEmpty")}</Typography>
                ) : (
                  <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                    {messageRecords.map((record) => (
                      <Stack
                        key={record.id}
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ sm: "center" }}
                        gap={1.5}
                        sx={{ py: 1.5 }}
                      >
                        <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                          <Typography fontWeight={600}>{record.titulo}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.responsavel || t("unknownRecipient")}
                            {record.criada_em ? ` · ${new Date(record.criada_em).toLocaleString()}` : ""}
                          </Typography>
                          {record.erro && (
                            <Typography variant="body2" color="error.main">{record.erro}</Typography>
                          )}
                          {record.lida_em && (
                            <Typography variant="caption" color="text.secondary">
                              {t("readAt", { date: new Date(record.lida_em).toLocaleString() })}
                            </Typography>
                          )}
                          {!record.lida_em && record.entregue_em && (
                            <Typography variant="caption" color="text.secondary">
                              {t("deliveredAt", { date: new Date(record.entregue_em).toLocaleString() })}
                            </Typography>
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                          <Chip
                            size="small"
                            label={t(`deliveryStatus.${record.status}`)}
                            color={record.status === "failed" ? "error" : record.status === "read" || record.status === "delivered" ? "success" : "default"}
                            variant={record.status === "queued" || record.status === "pending" ? "outlined" : "filled"}
                          />
                          {record.status === "failed" && record.pode_reenviar && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => void retryMessage(record.id)}
                              disabled={retryingMessageId !== null}
                            >
                              {retryingMessageId === record.id ? t("retrying") : t("retry")}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
