import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import WideContainer from "./layout/wide-layout";

interface HeaderProps {
  variant?: "default" | "admin";
  title?: string;
  showAuth?: boolean;
  locale?: string;
}

export async function Header({
  variant = "default",
  showAuth = true,
  locale = "vi",
}: HeaderProps) {
  // Enable static rendering
  setRequestLocale(locale);

  const isAdmin = variant === "admin";
  const t = await getTranslations('Header');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <WideContainer>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="m-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">{t('title')}</span>
          </div>

          {!isAdmin && (
            <nav className="hidden items-center space-x-6 md:flex">
              <a
                href="#features"
                className="font-medium text-sm transition-colors hover:text-primary"
              >
                {t('features')}
              </a>
              <a
                href="#courses"
                className="font-medium text-sm transition-colors hover:text-primary"
              >
                {t('courses')}
              </a>
              <a
                href="#community"
                className="font-medium text-sm transition-colors hover:text-primary"
              >
                {t('community')}
              </a>
              <a
                href="#about"
                className="font-medium text-sm transition-colors hover:text-primary"
              >
                {t('about')}
              </a>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            {!isAdmin && <MobileNav />}
            {showAuth && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  {isAdmin ? t('logout') : t('login')}
                </Button>
                {!isAdmin && (
                  <Button size="sm" className="hidden md:inline-flex">
                    {t('register')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </WideContainer>
    </header>
  );
}
