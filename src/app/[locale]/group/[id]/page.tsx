import GroupDetailContent from "../../../../components/group/detail/group-detail-content";
import DashboardLayout from "../../../../components/layout/dashboard-layout";
import { PageHeaderClient } from "../../../../components/layout/page-header-client";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { id } = await params;
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
          <GroupDetailContent id={id} />
        </div>
      </DashboardLayout>
    </>
  );
}
