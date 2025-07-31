import PomodoroContent from "@/components/pomodoro/pomodoro-content";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";

export default function PomodoroPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader
        title="Pomodoro"
        showThemeToggle={true}
      />

      {/* Main content */}
      <PomodoroContent />
    </DashboardLayout>
  );
}
