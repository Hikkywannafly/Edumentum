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
import { Textarea } from "@/components/ui/textarea";
import { useFileProcessor } from "@/hooks/use-file-processor";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { QuizMode, Visibility } from "@/types/quiz";
import { CheckCircle, Loader2, Settings, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

type InputMode = "FILE" | "TEXT";

interface FileWithAnswersUploaderProps {
  defaultMode?: InputMode;
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function FileWithAnswersUploader({
  defaultMode = "FILE",
  onProcessingStart,
  onProcessingDone,
}: FileWithAnswersUploaderProps) {
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Input mode selection
  const [inputMode, setInputMode] = useState<InputMode>(defaultMode);
  const [textContent, setTextContent] = useState("");

  // Enhanced settings for file extraction
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [mode, setMode] = useState<QuizMode>("QUIZ");

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    extractQuestionsFromFiles,
    extractQuestionsFromText,
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

  // Mark initial mount as complete
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  // Keep input mode in sync if parent changes defaultMode dynamically
  useEffect(() => {
    setInputMode(defaultMode);
  }, [defaultMode]);

  const handleCreateQuiz = async () => {
    if (isCreatingQuiz || isProcessing) return; // guard against double submit
    // Show processing screen immediately
    setIsCreatingQuiz(true);

    onProcessingStart?.(
      inputMode === "TEXT" ? "Text Content" : uploadedFiles[0]?.name || "File",
      inputMode === "TEXT"
        ? "Extracting quiz from text"
        : "Extracting quiz from file",
    );

    try {
      if (inputMode === "TEXT") {
        // Extract from text content
        await extractQuestionsFromText(textContent, {
          language: "AUTO",
          parsingMode: "BALANCED",
        });
      } else {
        // Extract from files
        await extractQuestionsFromFiles({
          language: "AUTO",
          parsingMode: "BALANCED",
        });
      }

      // Mark quiz as ready and show completion state

      onProcessingDone?.(true);

      // Wait a bit to show the completion state
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Parent will auto-hide overlay after showing completion state

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
      {/* Input Mode Selection removed; controlled by parent via defaultMode */}

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
          {/* Basic Settings */}
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

      {/* Content Input Area */}
      {inputMode === "FILE" ? (
        <>
          <FileUploadArea
            onDrop={isBusy ? () => {} : addFiles}
            isDragActive={isDragActive}
          />
          <FileList files={uploadedFiles} onRemoveFile={removeFile} />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Content
            </CardTitle>
            <CardDescription>
              Paste your quiz content with questions and answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content">Quiz Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Paste your quiz content here...\n\nExample:\n1. What is the capital of France?\na) London\nb) Berlin\nc) Paris\nd) Madrid\nAnswer: c) Paris"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                  disabled={isBusy}
                />
              </div>
              <div className="flex items-center justify-between text-muted-foreground text-sm">
                <span>{textContent.length} characters</span>
                <span>
                  {textContent.split("\n").filter((line) => line.trim()).length}{" "}
                  lines
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {inputMode === "FILE"
            ? "Upload file with questions and answers to extract quiz"
            : "Enter text content with questions and answers to extract quiz"}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={
              (inputMode === "FILE" && (!hasFiles || isProcessing)) ||
              (inputMode === "TEXT" && (!textContent.trim() || isProcessing)) ||
              isCreatingQuiz
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
