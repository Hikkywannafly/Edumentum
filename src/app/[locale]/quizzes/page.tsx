import { PageHeader } from "@/components/layout/page-header";
import { QuizzesContent } from "@/components/quizzes/quizzes-content";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import DashboardLayout from "../../../components/layout/dashboard-layout";

export default async function QuizzesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Quizzes');

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeader
          title={t('title')}
          action={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('createQuiz')}
            </Button>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <QuizzesContent />
      </div>
    </DashboardLayout>
  );
}
