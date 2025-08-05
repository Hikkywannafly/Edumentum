"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizEditorContent } from "@/components/quizzes/edit";
import { Button } from "@/components/ui/button";
// import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
// import { useRouter } from "next/navigation";

export default function QuizEditorPage() {
  // const router = useRouter();
  // const { quizData } = useQuizEditorStore();
  const t = useTranslations("Quizzes");

  // const handleSave = async () => {
  //   try {
  //     // Navigate back to quizzes page
  //     router.push("/quizzes");
  //   } catch (error) {
  //     console.error("Error saving quiz:", error);
  //   }
  // };

  // const handleCreateQuiz = async () => {
  //   if (!quizData) return;

  //   try {
  //     const quizDataToCreate = {
  //       title: quizData.title,
  //       description: quizData.description,
  //       visibility: true,
  //       total: quizData.questions.length,
  //       topic: "Auto-generated",
  //       quizCreationType: "FILE_UPLOAD" as const,
  //       questions: quizData.questions,
  //     };

  //     // Import quizAPI dynamically to avoid SSR issues
  //     const { quizAPI } = await import("@/lib/api/quiz");
  //     const response = await quizAPI.createQuiz(quizDataToCreate);
  //     console.log("Quiz created successfully:", response);

  //     // Navigate back to quizzes page
  //     router.push("/quizzes");
  //   } catch (error) {
  //     console.error("Error creating quiz:", error);
  //   }
  // };

  // const canSave = !!(quizData && quizData.questions.length > 0);
  // const canCreate = !!(quizData && quizData.questions.length > 0);

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("edit.title")}
          action={
            <div className="flex gap-2">
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("edit.backToQuizzes")}
                </Button>
              </LocalizedLink>
              {/* <Button onClick={handleSave} disabled={!canSave}>
                <Save className="mr-2 h-4 w-4" />
                {t("edit.saveDraft")}
              </Button>
              <Button onClick={handleCreateQuiz} disabled={!canCreate}>
                <Save className="mr-2 h-4 w-4" />
                {t("edit.createQuiz")}
              </Button> */}
            </div>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <QuizEditorContent />
      </div>
    </DashboardLayout>
  );
}
