import { AuthGuard } from "@/components/auth/auth-guard";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

import { OpenGraph } from "@/lib/og";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

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
          <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
            <LocaleProvider>
              <AuthProvider>
                <AuthGuard>
                  <main className="mx-auto ">{children}</main>
                </AuthGuard>
              </AuthProvider>
            </LocaleProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}
// export const dynamic = "force-dynamic"; // Ensures the layout is always re-rendered
