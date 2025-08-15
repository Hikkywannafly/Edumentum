import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import MindmapEditor from "@/components/mindmap/mindmap-editor";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface MindmapEditPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MindmapEditPage({
  params,
}: MindmapEditPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Mindmap");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("editTitle")}
          showThemeToggle={true}
          showLanguageSwitcher={true}
          className="border-border border-b"
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <MindmapEditor mindmapId={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
