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
import type {
  Difficulty,
  Language,
  ParsingMode,
  QuestionType,
  QuizMode,
  Task,
  Visibility,
} from "@/types/quiz";
import { Brain, Loader2, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileList } from "./file-list";
import { FileUploadArea } from "./file-upload-area";

type InputMode = "FILE" | "TEXT";

interface AIGeneratedUploaderProps {
  onProcessingStart?: (fileName: string, label?: string) => void;
  onProcessingDone?: (done: boolean) => void;
}

export function AIGeneratedUploader({
  onProcessingStart,
  onProcessingDone,
}: AIGeneratedUploaderProps) {
  // const t = useTranslations("Quizzes");
  const { goQuizEdit } = useLocalizedNavigation();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Input mode selection (auto-detected)
  const [inputMode, setInputMode] = useState<InputMode>("FILE");

  // AI Generation Settings
  const [generationMode, setGenerationMode] = useState<"GENERATE" | "EXTRACT">(
    "GENERATE",
  );
  const [fileProcessingMode, setFileProcessingMode] = useState<
    "PARSE_THEN_SEND" | "SEND_DIRECT"
  >("PARSE_THEN_SEND");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [language, setLanguage] = useState<Language>("AUTO");
  const [questionType, setQuestionType] = useState<QuestionType | "MIXED">(
    "MIXED",
  );
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [mode, setMode] = useState<QuizMode>("QUIZ");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [task, setTask] = useState<Task>("GENERATE_QUIZ");
  const [parsingMode, setParsingMode] = useState<ParsingMode>("BALANCED");

  const {
    uploadedFiles,
    addFiles,
    removeFile,
    generateQuestionsFromFiles,
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

  // Auto-select mode depending on input presence
  useEffect(() => {
    if (hasFiles) {
      setInputMode("FILE");
    } else {
      setInputMode("FILE");
    }
  }, [hasFiles]);

  const handleGenerateQuiz = async () => {
    // Show processing screen immediately
    setIsGenerating(true);
    onProcessingStart?.(
      uploadedFiles[0]?.name || "File",
      generationMode === "GENERATE"
        ? "Generating new quiz from your materials"
        : "Extracting existing quiz from your file",
    );

    try {
      const settings = {
        generationMode,
        fileProcessingMode,
        visibility,
        language,
        questionType: questionType === "MIXED" ? "MIXED" : questionType,
        numberOfQuestions,
        mode,
        difficulty,
        task,
        parsingMode,
      };

      if (inputMode === "FILE") {
        // Generate from files
        await generateQuestionsFromFiles(settings);
      }

      // mark as ready so ProcessingScreen shows completion state
      onProcessingDone?.(true);

      // brief delay so users can see the completed state
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Parent will auto-hide overlay after completion

      setEditing(true);
      goQuizEdit();
    } catch (error) {
      console.error("Error generating quiz:", error);
      setIsGenerating(false);
      onProcessingDone?.(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing overlay handled by parent (QuizCreator) */}

      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Quiz Generation Settings
            </CardTitle>
            <CardDescription>
              Configure how AI will generate your quiz questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generation-mode">Processing Mode</Label>
                <Select
                  value={generationMode}
                  onValueChange={(value: "GENERATE" | "EXTRACT") =>
                    setGenerationMode(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="GENERATE">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">🧠 Generate Quiz</span>
                        <span className="text-muted-foreground text-xs">
                          Use AI to create new quiz questions from the material
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EXTRACT">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">📋 Extract Quiz</span>
                        <span className="text-muted-foreground text-xs">
                          Extract existing quiz questions from material (quiz
                          format only)
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-processing-mode">File Processing</Label>
                <Select
                  value={fileProcessingMode}
                  onValueChange={(value: "PARSE_THEN_SEND" | "SEND_DIRECT") =>
                    setFileProcessingMode(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="PARSE_THEN_SEND">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">📄 Parse Then Send</span>
                        <span className="text-muted-foreground text-xs">
                          Convert file to text first (faster, cheaper)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SEND_DIRECT">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">🎯 Send Direct</span>
                        <span className="text-muted-foreground text-xs">
                          Send file directly to AI (preserves formatting)
                          <br />
                          <span className="text-[10px] opacity-75">
                            Images only. Other file types will be parsed to text
                            automatically.
                          </span>
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                <Label htmlFor="language">Language</Label>
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

            {/* Question Settings - Only show for GENERATE mode */}
            {generationMode === "GENERATE" && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
                    <Brain className="h-4 w-4" />
                    Question Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-type">Question Type</Label>
                      <Select
                        value={questionType}
                        onValueChange={(value: QuestionType | "MIXED") =>
                          setQuestionType(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="MIXED">Mixed Types</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                          <SelectItem value="FILL_BLANK">
                            Fill in the Blank
                          </SelectItem>
                          <SelectItem value="FREE_RESPONSE">
                            Free Response
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={difficulty}
                        onValueChange={(value: Difficulty) =>
                          setDifficulty(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="number-of-questions">
                      Number of Questions
                    </Label>
                    <Select
                      value={String(numberOfQuestions)}
                      onValueChange={(val) => setNumberOfQuestions(Number(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => {
                          const val = i + 5;
                          return (
                            <SelectItem key={val} value={String(val)}>
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings - Only show for GENERATE mode */}
            {generationMode === "GENERATE" && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium text-sm">
                    <Sparkles className="h-4 w-4" />
                    Advanced Options
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
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
                          <SelectItem value="STUDY_GUIDE">
                            Study Guide
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task">Task</Label>
                      <Select
                        value={task}
                        onValueChange={(value: Task) => setTask(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="GENERATE_QUIZ">
                            Generate Quiz
                          </SelectItem>
                          <SelectItem value="REVIEW">
                            Review Material
                          </SelectItem>
                          <SelectItem value="TEST">Test Knowledge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parsing-mode">AI Processing</Label>
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
                                Quick generation
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="BALANCED">
                            <div className="flex flex-col items-start">
                              <span>Balanced</span>
                              <span className="text-muted-foreground text-xs">
                                Good balance
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="THOROUGH">
                            <div className="flex flex-col items-start">
                              <span>Thorough</span>
                              <span className="text-muted-foreground text-xs">
                                Detailed analysis
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Area */}
        <FileUploadArea onDrop={addFiles} isDragActive={isDragActive} />

        <FileList files={uploadedFiles} onRemoveFile={removeFile} />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {generationMode === "GENERATE"
              ? "Upload files and AI will generate quiz questions from the content"
              : "Upload quiz files and extract existing questions and answers"}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={!hasFiles || isProcessing || isGenerating}
              onClick={handleGenerateQuiz}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {generationMode === "GENERATE"
                    ? "Generating Quiz..."
                    : "Extracting Quiz..."}
                </>
              ) : (
                <>
                  {generationMode === "GENERATE" ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate AI Quiz
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Extract Quiz
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </>
    </div>
  );
}
