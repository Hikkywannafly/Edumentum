import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { AchievementsContent } from "../../../components/achievements/achievements-content";
import { PageHeader } from "../../../components/layout";
import DashboardLayout from "../../../components/layout/dashboard-layout";

export default async function AchievementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Achievements");
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeader
            title={t("title")}
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <AchievementsContent />
        </div>
      </DashboardLayout>
    </>
  );
}
