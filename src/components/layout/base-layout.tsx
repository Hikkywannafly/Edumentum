import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

interface BaseLayoutProps {
  showHeader?: boolean;
  showFooter?: boolean;
  children: React.ReactNode;
  title?: string;
}

export default function BaseLayout({
  children,
  showHeader = true,
  showFooter = true,
  title = "EDUMENTUM",
}: BaseLayoutProps) {
  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-slate-900 dark:via-background dark:to-slate-800">
        {showHeader && <Header title={title} />}
        <main>{children}</main>
        {showFooter && <Footer />}
      </div>
    </React.Fragment>
  );
}
