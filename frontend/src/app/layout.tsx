import type { Metadata } from "next";
import "./globals.css";
import { Box } from "@mui/material";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/auth/AuthGate";
import { LanguageProvider } from "@/context/LanguageContext";
import ToastProvider from "@/components/ToastProvider";
import { PublicI18nProvider } from "@/context/PublicI18nProvider";

export const metadata: Metadata = {
  title: "Advocacia Gestão - Sistema de Gestão Jurídica",
  description:
    "Sistema de gestão jurídica para advogados e escritórios de advocacia, com controle de clientes, processos e prazos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <LanguageProvider>
            <AuthProvider>
              <PublicI18nProvider>
                <NotificationsProvider>
                  <Box display="flex" flexDirection="column" minHeight="100vh">
                    <Box component="main" flex={1}>
                      <AuthGate>{children}</AuthGate>
                    </Box>
                  </Box>
                  <ToastProvider />
                </NotificationsProvider>
              </PublicI18nProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
