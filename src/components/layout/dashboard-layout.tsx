"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ErrorBoundary } from "@/components/sidebar/error_boundary";
import type React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
