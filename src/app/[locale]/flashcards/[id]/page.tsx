import { FlashcardStudyView } from "@/components/flashcards/flashcard-study-view";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui";
import { Home } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface FlashcardDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function FlashcardDetailPage({
  params,
}: FlashcardDetailPageProps) {
  const { id } = await params;
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Flashcards");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("title")}
          action={
            <LocalizedLink href="/flashcards">
              <Button size="sm">
                <Home className="h-4 w-4" />
                {t("create.backToFlashcards")}
              </Button>
            </LocalizedLink>
          }
          showLanguageSwitcher={true}
          showThemeToggle={true}
        />

        {/* Main Content */}
        <FlashcardStudyView flashcardSetId={Number(id)} />
      </div>
    </DashboardLayout>
  );
}
