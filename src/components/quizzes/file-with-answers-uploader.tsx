"use client";

import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/use-file-processor";
import { quizAPI } from "@/lib/api/quiz";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { CheckCircle, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";
import { QuizEditorDialog } from "./quiz-editor-dialog";
import { QuizPreview } from "./quiz-preview";

export function FileWithAnswersUploader() {
  const t = useTranslations("Quizzes");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  const { isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  const handleEditQuiz = () => {
    setIsEditorOpen(true);
  };

  const handleSaveQuiz = async (quizData: {
    title: string;
    description: string;
    questions: any[];
  }) => {
    try {
      setIsCreating(true);

      // Use legacy API for now
      const quizRequestData = {
        title: quizData.title,
        description: quizData.description,
        visibility: true,
        total: quizData.questions.length,
        topic: "Auto-generated",
        quizCreationType: "FILE_UPLOAD" as const,
        questions: quizData.questions,
      };

      const response = await quizAPI.createQuiz(quizRequestData);
      console.log("Quiz created successfully:", response);

      // Update the generated quiz with edited data
      updateQuizDetails({
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions,
      });

      // TODO: Show success toast and redirect
    } catch (error) {
      console.error("Error creating quiz:", error);
      // TODO: Show error toast
    } finally {
      setIsCreating(false);
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

      {/* Quiz Editor Dialog */}
      <QuizEditorDialog
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveQuiz}
        initialQuiz={generatedQuiz || undefined}
      />
    </div>
  );
}
