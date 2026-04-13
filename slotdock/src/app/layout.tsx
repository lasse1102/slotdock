import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://slotdock.app";
const siteDescription =
  "SlotDock ist die Online-Rampenbuchung für Fulfillment-Unternehmen — Spediteure reservieren Zeitfenster selbst, das Lager plant stressfrei.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SlotDock — Online-Rampenbuchung für Fulfillment-Unternehmen",
    template: "%s | SlotDock",
  },
  description: siteDescription,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "SlotDock",
    title: "SlotDock — Online-Rampenbuchung für Fulfillment-Unternehmen",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "SlotDock — Online-Rampenbuchung",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
