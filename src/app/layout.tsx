import type { Metadata, Viewport } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { PrivacyProvider } from "@/components/privacy-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "Credi · Calculadoras financieras para Colombia",
    template: "%s · Credi",
  },
  description:
    "Calcula créditos, compara abonos a capital y proyecta inversiones en pesos colombianos. Tablas, gráficas y reportes PDF gratis, sin registro.",
  applicationName: "Credi",
  robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
  openGraph: {
    locale: "es_CO",
    type: "website",
    siteName: "Credi",
    title: "Credi · Entiende tus números",
    description:
      "Créditos, abonos e inversiones. Calcula gratis y decide con claridad.",
  },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};
export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <SessionProvider>
          <PrivacyProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </PrivacyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
