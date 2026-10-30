"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
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
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

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
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
