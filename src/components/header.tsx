import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface HeaderProps {
  variant?: "default" | "admin";
  title?: string;
  showAuth?: boolean;
}

export function Header({
  variant = "default",
  title = "EDUMENTUM",
  showAuth = true,
}: HeaderProps) {
  const isAdmin = variant === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="m-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">{title}</span>
        </div>

        {!isAdmin && (
          <nav className="hidden items-center space-x-6 md:flex">
            <a
              href="#features"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Tính năng
            </a>
            <a
              href="#courses"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Khóa học
            </a>
            <a
              href="#community"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Cộng đồng
            </a>
            <a
              href="#about"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Về chúng tôi
            </a>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {!isAdmin && <MobileNav />}
          {showAuth && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex"
              >
                {isAdmin ? "Đăng xuất" : "Đăng nhập"}
              </Button>
              {!isAdmin && (
                <Button size="sm" className="hidden md:inline-flex">
                  Đăng ký
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
