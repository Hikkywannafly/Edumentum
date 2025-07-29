"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import type React from "react";

interface PageHeaderClientProps {
  titleKey: string; // Translation key instead of direct title
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
}

export function PageHeaderClient({
  titleKey,
  action,
  children,
  className = "",
  showThemeToggle = true,
  showLanguageSwitcher = true
}: PageHeaderClientProps) {
  const t = useTranslations();
  const title = t(titleKey);

  return (
    <header className={`flex h-16 items-center gap-3 border-b px-4 ${className}`}>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="font-semibold text-xl">{title}</h1>

      {/* Center: Optional children content */}
      <div className="flex-1">{children}</div>

      {/* Right side: Actions and controls */}
      <div className="flex items-center gap-2">
        {/* Custom action button */}
        {action && <div>{action}</div>}

        {/* Theme and Language controls */}
        <div className="flex items-center gap-2">
          {showThemeToggle && <ThemeToggle />}
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
      </div>
    </header>
  );
}
