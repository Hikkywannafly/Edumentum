import { LanguageSwitcher } from "@/components/language-switcher";
import { LocalizedLink } from "@/components/localized-link";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import WideContainer from "./layout/wide-layout";

interface HeaderProps {
  variant?: "default" | "admin";
  title?: string;
  showAuth?: boolean;
}

export async function Header({
  variant = "default",
  showAuth = true,
}: HeaderProps) {
  const isAdmin = variant === "admin";
  const t = await getTranslations('Header');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <WideContainer>
        <div className="container flex h-16 items-center justify-between">
          <LocalizedLink href="" className="flex items-center space-x-2">
            <div className="m-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">{t('title')}</span>
          </LocalizedLink>

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
                {isAdmin ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex"
                  >
                    {t('logout')}
                  </Button>
                ) : (
                  <LocalizedLink href="login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:inline-flex"
                    >
                      {t('login')}
                    </Button>
                  </LocalizedLink>
                )}
                {!isAdmin && (
                  <LocalizedLink href="register">
                    <Button size="sm" className="hidden md:inline-flex">
                      {t('register')}
                    </Button>
                  </LocalizedLink>
                )}
              </>
            )}
          </div>
        </div>
      </WideContainer>
    </header>
  );
}
