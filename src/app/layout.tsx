import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';

import { OpenGraph } from "@/lib/og";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...OpenGraph,
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-background font-sans text-foreground antialiased`}
      >
        <NextTopLoader />
        <ThemeProvider>
          <LocaleProvider>
            <main className="mx-auto ">{children}</main>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
