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
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";
import { ProcessingScreen } from "./processing-screen";

export function FileWithAnswersUploader() {
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Simple settings for file upload
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
    setIsCreatingQuiz(true);
    try {
      // Extract questions from uploaded files
      await extractQuestionsFromFiles();

      setEditing(true);
      goQuizEdit();
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  return (
    <div className="space-y-6 border-none">
      {/* Simple Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
          <CardDescription>Basic settings for your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value: Visibility) => setVisibility(value)}
              >
                <SelectTrigger className="w-full">
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
              >
                <SelectTrigger className="w-full">
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

      {/* Upload Area */}
      <FileUploadArea onDrop={addFiles} isDragActive={isDragActive} />

      {/* Show Processing Screen or File List */}
      {isCreatingQuiz ? (
        <ProcessingScreen
          fileName={uploadedFiles[0]?.name || "File"}
          onComplete={() => {
            // Processing complete callback
          }}
        />
      ) : (
        <>
          {/* Uploaded Files */}
          <FileList files={uploadedFiles} onRemoveFile={removeFile} />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Upload file with questions and answers to extract quiz
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
        </>
      )}
    </div>
  );
}
