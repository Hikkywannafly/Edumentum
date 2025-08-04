import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import PomodoroContent from "@/components/pomodoro/pomodoro-content";
import { setRequestLocale } from "next-intl/server";

export default async function PomodoroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeaderClient title="Pomodoro" showThemeToggle={true} />

      {/* Main content */}
      <PomodoroContent />
    </DashboardLayout>
  );
}
