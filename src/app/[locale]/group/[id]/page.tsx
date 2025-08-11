import GroupDetailContent from "../../../../components/group/detail/group-detail-content";
import DashboardLayout from "../../../../components/layout/dashboard-layout";
import { PageHeaderClient } from "../../../../components/layout/page-header-client";

export default function GroupDetailPage() {
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeaderClient
            title={"Group Page"}
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <GroupDetailContent />
        </div>
      </DashboardLayout>
    </>
  );
}
