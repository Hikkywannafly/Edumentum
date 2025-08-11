"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { memo } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = memo(function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, shouldRender } = useAuthGuard();

  if (isLoading || !shouldRender) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
});
