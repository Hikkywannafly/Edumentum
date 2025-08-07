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
import type { Language, ParsingMode, QuizMode, Visibility } from "@/types/quiz";
import { CheckCircle, FileText, Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";
import { ProcessingScreen } from "./processing-screen";

export function FileWithAnswersUploader() {
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Enhanced settings for file extraction
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [mode, setMode] = useState<QuizMode>("QUIZ");
  const [parsingMode, setParsingMode] = useState<ParsingMode>("BALANCED");
  const [language, setLanguage] = useState<Language>("AUTO");

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
    // Show processing screen immediately
    setIsCreatingQuiz(true);
    setTimeout(async () => {
      try {
        await extractQuestionsFromFiles();
        await new Promise((resolve) => setTimeout(resolve, 500));

        setEditing(true);
        goQuizEdit();
      } catch (error) {
        console.error("Error creating quiz:", error);

        setIsCreatingQuiz(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-6 border-none">
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
          {/* Enhanced Settings */}
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

              {/* Extraction Settings */}
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
                    <FileText className="h-4 w-4" />
                    Extraction Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parsing-mode">Extraction Quality</Label>
                      <Select
                        value={parsingMode}
                        onValueChange={(value: ParsingMode) =>
                          setParsingMode(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="FAST">
                            <div className="flex flex-col items-start">
                              <span>Fast</span>
                              <span className="text-muted-foreground text-xs">
                                Quick extraction, basic accuracy
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="BALANCED">
                            <div className="flex flex-col items-start">
                              <span>Balanced</span>
                              <span className="text-muted-foreground text-xs">
                                Good balance of speed and accuracy
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="THOROUGH">
                            <div className="flex flex-col items-start">
                              <span>Thorough</span>
                              <span className="text-muted-foreground text-xs">
                                Detailed extraction, highest accuracy
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language Detection</Label>
                      <Select
                        value={language}
                        onValueChange={(value: Language) => setLanguage(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="AUTO">🌐 Auto Detect</SelectItem>
                          <SelectItem value="EN">🇺🇸 English</SelectItem>
                          <SelectItem value="VI">🇻🇳 Tiếng Việt</SelectItem>
                          <SelectItem value="KO">🇰🇷 한국어</SelectItem>
                          <SelectItem value="ZH">🇨🇳 中文</SelectItem>
                          <SelectItem value="JA">🇯🇵 日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <FileUploadArea onDrop={addFiles} isDragActive={isDragActive} />

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
