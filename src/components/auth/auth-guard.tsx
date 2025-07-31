"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { memo } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = memo(function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, shouldRender } = useAuthGuard();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render if conditions not met
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
});
