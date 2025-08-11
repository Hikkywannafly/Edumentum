import { FlashcardsContent } from "@/components/flashcards/flashcards-content";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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
            <LocalizedLink href="flashcards/create">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("createFlashcard")}
              </Button>
            </LocalizedLink>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <FlashcardsContent />
      </div>
    </DashboardLayout>
  );
}
