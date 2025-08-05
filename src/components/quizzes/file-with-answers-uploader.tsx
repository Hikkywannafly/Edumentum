"use client";

import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/use-file-processor";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

export function FileWithAnswersUploader() {
  const t = useTranslations("Quizzes");
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const {
    uploadedFiles,
    generatedQuiz,
    addFiles,
    removeFile,
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

  // Mark initial mount as complete
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  const handleCreateQuiz = async () => {
    if (!generatedQuiz) return;

    setIsCreatingQuiz(true);
    try {
      // Set editing mode and navigate to edit page
      setEditing(true);
      goQuizEdit();
    } catch (error) {
      console.error("Error navigating to edit page:", error);
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  return (
    <div className="space-y-6 border-none">
      {/* Upload Area */}
      <FileUploadArea onDrop={addFiles} isDragActive={isDragActive} />

      {/* Uploaded Files */}
      <FileList files={uploadedFiles} onRemoveFile={removeFile} />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("create.fileWithAnswers.guidance")}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={
              !hasFiles || isProcessing || !hasGeneratedQuiz || isCreatingQuiz
            }
            onClick={handleCreateQuiz}
            className="flex items-center gap-2"
          >
            {isCreatingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing Quiz...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
