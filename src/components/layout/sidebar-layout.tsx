"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";
import { ErrorBoundary } from "../sidebar/error_boundary";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen">
          <AppSidebar />
          {/* Main content - always starts from left edge, sidebar overlays on top */}
          <main className="w-full min-w-0 flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
