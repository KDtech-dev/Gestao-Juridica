import { headers } from "next/headers";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Box } from "@mui/material";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/auth/AuthGate";
import { LanguageProvider } from "@/context/LanguageContext";
import ToastProvider from "@/components/ToastProvider";
import { PublicI18nProvider } from "@/context/PublicI18nProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Advocacia Gestão - Sistema de Gestão Jurídica",
  description:
    "Sistema de gestão jurídica para advogados e escritórios de advocacia, com controle de clientes, processos e prazos.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") ?? "pt") as "pt" | "en" | "es";

  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <LanguageProvider initialLocale={locale}>
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