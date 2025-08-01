import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import KanbanContent from "../../../components/kanban/kanban-content";

export default function PomodoroPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader title="Kanban Board" showThemeToggle={true} />

      {/* Main content */}
      <KanbanContent />
    </DashboardLayout>
  );
}
