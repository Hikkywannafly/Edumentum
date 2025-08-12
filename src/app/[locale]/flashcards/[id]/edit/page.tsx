import { FlashcardEditorContent } from "@/components/flashcards/edit";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface FlashcardEditPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function FlashcardEditPage({
  params,
}: FlashcardEditPageProps) {
  const { id } = await params;
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Flashcards");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeaderClient
          title={t("create.title")}
          action={
            <div className="flex gap-2">
              <LocalizedLink href="/flashcards">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("create.backToFlashcards")}
                </Button>
              </LocalizedLink>
            </div>
          }
        />

        <FlashcardEditorContent flashcardSetId={id} />
      </div>
    </DashboardLayout>
  );
}
