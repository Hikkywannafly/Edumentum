"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import PomodoroContent from "@/components/pomodoro/pomodoro-content";
import { usePomodoro } from "@/contexts/pomodoro-context";
import { useEffect } from "react";

export default function PomodoroPage() {
  const { setIsMini } = usePomodoro();

  // Tự động mở full view khi vào trang pomodoro
  useEffect(() => {
    setIsMini(false);
  }, [setIsMini]);

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeaderClient title="Pomodoro" showThemeToggle={true} />

      {/* Main content */}
      <PomodoroContent />
    </DashboardLayout>
  );
}
