"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireRole = true
}: AuthGuardProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // If role is required but user doesn't have role
    if (requireRole && isAuthenticated && !hasRole) {
      router.push("/role-selector");
      return;
    }

    // If user is authenticated and has role, but trying to access auth pages
    if (isAuthenticated && hasRole) {
      const currentPath = window.location.pathname;
      if (currentPath.includes("/login") || currentPath.includes("/register") || currentPath.includes("/role-selector")) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, hasRole, isLoading, requireAuth, requireRole, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }

  // If role is required but user doesn't have role
  if (requireRole && isAuthenticated && !hasRole) {
    return null; // Will redirect to role selector
  }

  return <>{children}</>;
}
