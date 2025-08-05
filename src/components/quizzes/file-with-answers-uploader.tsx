"use client";

import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { quizAPI } from "@/lib/api/quiz";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { CheckCircle, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";
import { QuizPreview } from "./quiz-preview";

export function FileWithAnswersUploader() {
  const t = useTranslations("Quizzes");
  const router = useRouter();
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const {
    uploadedFiles,
    generatedQuiz,
    addFiles,
    removeFile,
    updateQuizDetails,
    isProcessing,
    hasFiles,
    hasGeneratedQuiz,
  } = useFileProcessor();

  const { setEditing } = useQuizEditorStore();

  const { isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  // Auto-navigate to edit page when quiz is generated
  useEffect(() => {
    console.log("Auto-navigation check:", {
      generatedQuiz: !!generatedQuiz,
      hasGeneratedQuiz,
      uploadedFilesLength: uploadedFiles.length,
      isProcessing: uploadedFiles.some(
        (f) => f.status === "uploading" || f.status === "processing",
      ),
    });

    if (generatedQuiz && hasGeneratedQuiz && !isInitialMount) {
      const isProcessing = uploadedFiles.some(
        (f) => f.status === "uploading" || f.status === "processing",
      );

      if (!isProcessing) {
        console.log("Navigating to edit page...");
        setEditing(true);
        // Navigate to edit page with locale
        const currentLocale = pathname.split("/")[1]; // Get locale from current path
        router.push(`/${currentLocale}/quizzes/edit`);
      }
    }
  }, [
    generatedQuiz,
    hasGeneratedQuiz,
    uploadedFiles,
    isInitialMount,
    pathname,
    router,
    setEditing,
  ]);

  // Mark initial mount as complete
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  const handleEditQuiz = () => {
    if (generatedQuiz) {
      setEditing(true);
      // Navigate to edit page with locale
      const currentLocale = pathname.split("/")[1]; // Get locale from current path
      router.push(`/${currentLocale}/quizzes/edit`);
    }
  };

  const handleCreateQuiz = async () => {
    if (!generatedQuiz) return;

    try {
      setIsCreating(true);

      const quizData = {
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        visibility: true,
        total: generatedQuiz.questions.length,
        topic: "Auto-generated",
        quizCreationType: "FILE_UPLOAD" as const,
        questions: generatedQuiz.questions,
      };

      const response = await quizAPI.createQuiz(quizData);
      console.log("Quiz created successfully:", response);

      // TODO: Show success toast and redirect
    } catch (error) {
      console.error("Error creating quiz:", error);
      // TODO: Show error toast
    } finally {
      setIsCreating(false);
    }
  };

  console.log(
    "test ",
    generatedQuiz,
    hasGeneratedQuiz,
    uploadedFiles,
    isInitialMount,
  );
  return (
    <div className="space-y-6 border-none">
      {/* Upload Area */}
      <FileUploadArea onDrop={addFiles} isDragActive={isDragActive} />

      {/* Uploaded Files */}
      <FileList files={uploadedFiles} onRemoveFile={removeFile} />

      {/* Generated Quiz Preview */}
      {generatedQuiz && (
        <QuizPreview quiz={generatedQuiz} onUpdateQuiz={updateQuizDetails} />
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("create.fileWithAnswers.guidance")}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!hasFiles || isProcessing || !hasGeneratedQuiz}
            onClick={handleEditQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Quiz
          </Button>
          <Button
            disabled={
              !hasFiles || isProcessing || !hasGeneratedQuiz || isCreating
            }
            onClick={handleCreateQuiz}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isCreating
              ? "Creating..."
              : t("create.fileWithAnswers.createQuiz")}
          </Button>
        </div>
      </div>
    </div>
  );
}
