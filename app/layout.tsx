import type { Metadata } from "next";
import EventSyncProvider from "@/components/EventSyncProvider";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

/* ── Display font — editorial, used sparingly for hero text ── */
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/* ── UI font — everything else: nav, forms, buttons, numbers ── */
const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plannia — Planifica. Coordina. Celebra.",
  description: "La plataforma de gestión de eventos para el organizador primerizo en Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <EventSyncProvider>{children}</EventSyncProvider>
      </body>
    </html>
  );
}
