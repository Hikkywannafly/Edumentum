import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import MindmapContent from "@/components/mindmap/mindmap-content";
import { MindmapCreateButton } from "@/components/mindmap/mindmap-create-button";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function MindmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Mindmap");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("title")}
          action={<MindmapCreateButton />}
          showThemeToggle={true}
          showLanguageSwitcher={true}
          className="border-border border-b"
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <MindmapContent />
        </div>
      </div>
    </DashboardLayout>
  );
}
