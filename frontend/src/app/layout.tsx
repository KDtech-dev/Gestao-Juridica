import { headers } from "next/headers";
import type { Metadata } from "next";
import { BRANDING, productLogoSrc } from "@/configs/branding";
import { demoOffice } from "@/configs/demoOffice";
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
import { DemoNotice } from "@/components/DemoNotice";
import { getTranslation } from "@/services/i18n";
import { getRequestLocale } from "@/services/requestLocale";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title = `${demoOffice.productName} | KDTech`;
  const description = getTranslation(locale, "public.productHome.subtitle");

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://gestao-juridica.example",
    ),
    title,
    applicationName: BRANDING.appName,
    icons: {
      icon: [{ url: productLogoSrc, type: "image/svg+xml" }],
      apple: productLogoSrc,
    },
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: demoOffice.productName,
      images: [{ url: productLogoSrc, alt: demoOffice.productName }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [productLogoSrc],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") ?? "pt") as "pt" | "en" | "es";

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : locale}
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <LanguageProvider initialLocale={locale}>
            <AuthProvider>
              <PublicI18nProvider>
                <NotificationsProvider>
                  <Box display="flex" flexDirection="column" minHeight="100vh">
                    <Box component="main" flex={1}>
                      <DemoNotice />
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
