import { useAuth } from "@/contexts/auth-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useAuthGuard() {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize public pages check
  const isPublicPage = useMemo(() => {
    const publicPages = ["/", "/login", "/register"];
    return publicPages.some((page) => {
      if (page === "/") {
        return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
      }
      return pathname.includes(page);
    });
  }, [pathname]);

  // Memoize locale
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  // Memoize redirect logic
  const shouldRedirect = useMemo(() => {
    if (isLoading) return null;

    // Case 1: Not authenticated and trying to access protected page
    if (!isAuthenticated && !isPublicPage) {
      return `/${locale}/login`;
    }

    // Case 2: Authenticated but no role and not on setup
    if (isAuthenticated && !hasRole && !pathname.includes("/setup")) {
      return `/${locale}/setup`;
    }

    // Case 3: Authenticated with role and on auth pages
    if (
      isAuthenticated &&
      hasRole &&
      (pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/setup"))
    ) {
      return `/${locale}`;
    }

    return null;
  }, [isAuthenticated, hasRole, isLoading, pathname, locale, isPublicPage]);

  // Debounced redirect handler
  const handleRedirect = useCallback(
    (url: string) => {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Set a small delay to prevent rapid redirects
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(url);
      }, 100);
    },
    [router],
  );

  // Handle redirects with debounce
  useEffect(() => {
    if (shouldRedirect) {
      handleRedirect(shouldRedirect);
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [shouldRedirect, handleRedirect]);

  // Memoize render conditions
  const shouldRender = useMemo(() => {
    // Don't render if loading
    if (isLoading) return false;

    // Don't render if not authenticated and on protected page
    if (!isAuthenticated && !isPublicPage) return false;

    // Don't render if authenticated without role and not on setup
    if (isAuthenticated && !hasRole && !pathname.includes("/setup"))
      return false;

    return true;
  }, [isAuthenticated, hasRole, isLoading, pathname, isPublicPage]);

  return {
    isLoading,
    shouldRender,
    isAuthenticated,
    hasRole,
    isPublicPage,
  };
}
