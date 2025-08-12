"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFileProcessor } from "@/hooks/use-file-processor";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { QuizMode, Visibility } from "@/types/quiz";
import { CheckCircle, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

interface FileWithAnswersUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function FileWithAnswersUploader({
  onProcessingStart,
  onProcessingDone,
}: FileWithAnswersUploaderProps) {
  const { goQuizEdit } = useLocalizedNavigation();
  // removed initial mount fla
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Enhanced settings for file extraction
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [mode, setMode] = useState<QuizMode>("QUIZ");

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    extractQuestionsFromFiles,

    isProcessing,
    hasFiles,
  } = useFileProcessor();

  const { setEditing } = useQuizEditorStore();

  // Busy when creating quiz or underlying processor is working
  const isBusy = isCreatingQuiz || isProcessing;

  const { isDragActive } = useDropzone({
    disabled: isBusy,
    onDrop: (files) => {
      if (!isBusy) addFiles(files);
    },
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  const handleCreateQuiz = async () => {
    if (isCreatingQuiz || isProcessing) return; // guard against double submit

    setIsCreatingQuiz(true);

    onProcessingStart?.(
      uploadedFiles[0]?.name || "File",
      "Extracting quiz from file",
    );

    try {
      await extractQuestionsFromFiles({
        language: "AUTO",
        parsingMode: "BALANCED",
      });

      // Navigate immediately; parent overlay stays until route change
      onProcessingDone?.(true);
      setEditing(true);
      goQuizEdit();
    } catch (error) {
      console.error("Error creating quiz:", error);
      setIsCreatingQuiz(false);

      onProcessingDone?.(false);
    }
  };

  return (
    <div
      className={`space-y-6 border-none ${isBusy ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={isBusy}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
          <CardDescription>
            Configure your quiz extraction settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value: Visibility) => setVisibility(value)}
                disabled={isBusy}
              >
                <SelectTrigger className="w-full" disabled={isBusy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="UNLISTED">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select
                value={mode}
                onValueChange={(value: QuizMode) => setMode(value)}
                disabled={isBusy}
              >
                <SelectTrigger className="w-full" disabled={isBusy}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="FLASHCARD">Flashcard</SelectItem>
                  <SelectItem value="STUDY_GUIDE">Study Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <>
        <FileUploadArea
          onDrop={isBusy ? () => {} : addFiles}
          isDragActive={isDragActive}
        />
        <FileList files={uploadedFiles} onRemoveFile={removeFile} />
      </>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {"Upload file with questions and answers to extract quiz"}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!hasFiles || isProcessing || isCreatingQuiz}
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
