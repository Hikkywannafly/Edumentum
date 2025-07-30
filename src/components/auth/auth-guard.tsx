"use client";

import { useAuth } from "@/contexts/auth-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    // Public page dont require ath
    const publicPages = ["/", "/login", "/register", "/settings"];
    const isPublicPage = publicPages.some(page => {
      if (page === "/") {
        return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
      }
      return pathname.includes(page);
    });

    const locale = getLocaleFromPathname(pathname);

    // If user is not auth and trying to access protected page
    if (!isAuthenticated && !isPublicPage) {
      router.push(`/${locale}/login`);
      return;
    }

    // If user is auth but has no role (GUEST), redirect to role selector
    if (isAuthenticated && !hasRole && !pathname.includes("/role-selector") && !pathname.includes("/settings")) {
      router.push(`/${locale}/role-selector`);
      return;
    }

    // If user is auth and has role, redirect from auth pages to dashboard (but allow settings)
    if (isAuthenticated && hasRole && (pathname.includes("/login") || pathname.includes("/register") || pathname.includes("/role-selector"))) {
      router.push(`/${locale}/dashboard`);
      return;
    }
  }, [isAuthenticated, hasRole, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and trying to access protected page, don't render
  const publicPages = ["/", "/login", "/register"];
  const isPublicPage = publicPages.some(page => {
    if (page === "/") {
      return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
    }
    return pathname.includes(page);
  });

  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  // If user is authenticated but has no role and not on role-selector or settings, don't render
  if (isAuthenticated && !hasRole && !pathname.includes("/role-selector") && !pathname.includes("/settings")) {
    return null;
  }

  return <>{children}</>;
}
