import {
  extractQuestions,
  generateQuestions,
} from "@/lib/services/ai-llm.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { Language, ParsingMode, QuestionData } from "@/types/quiz";
import { useCallback, useEffect, useState } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  parsedContent?: string;
  extractedQuestions?: QuestionData[];
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuestionData[];
}

const fileParser = new FileParserService();

// Extract questions from file content (for files with existing questions - NO AI)
const extractQuestionsFromContent = async (
  content: string,
  settings?: {
    language?: Language;
    parsingMode?: ParsingMode;
  },
): Promise<QuestionData[]> => {
  console.log(" Extracting questions from file content (direct parsing)...");

  const result = await extractQuestions({
    fileContent: content,
    settings: {
      language: settings?.language,
      parsingMode: settings?.parsingMode,
    },
  });

  if (!result.success || !result.questions) {
    throw new Error(result.error || "Failed to extract questions from content");
  }

  console.log(` Successfully extracted ${result.questions.length} questions`);
  return result.questions;
};

// Generate NEW questions using AI (for AI-generated quizzes)
const generateQuestionsWithAI = async (
  content: string,
  settings?: {
    visibility?: string;
    language?: string;
    questionType?: string;
    numberOfQuestions?: number;
    mode?: string;
    difficulty?: string;
    task?: string;
    parsingMode?: string;
  },
): Promise<QuestionData[]> => {
  const apiKey =
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
    "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";

  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  console.log(" Generating new questions with AI...");

  const result = await generateQuestions({
    questionHeader: "Generate Quiz Questions",
    questionDescription:
      "Generate new quiz questions from the provided content.",
    apiKey,
    fileContent: content,
    settings,
  });

  if (!result.success || !result.questions) {
    throw new Error(result.error || "Failed to generate questions");
  }

  console.log(` Successfully generated ${result.questions.length} questions`);
  return result.questions;
};

export function useFileProcessor() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { setQuizData, updateQuizData } = useQuizEditorStore();

  const processFile = useCallback(
    async (fileInfo: UploadedFile, actualFile: File) => {
      try {
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? { ...file, status: "processing", progress: 50 }
              : file,
          ),
        );

        const content = await fileParser.parseFile(actualFile);
        console.log("content", content);
        setUploadedFiles((prev) => {
          const updatedFiles = prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "success" as const,
                  progress: 100,
                  parsedContent: content,
                  extractedQuestions: [], // Don't extract yet, just parse
                }
              : file,
          );

          return updatedFiles;
        });
      } catch (error) {
        console.error("Error processing file:", error);
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : file,
          ),
        );
      }
    },
    [],
  );

  const addFiles = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      for (const file of newFiles) {
        await processFile(file, acceptedFiles[newFiles.indexOf(file)]);
      }
    },
    [processFile],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setUploadedFiles((prev) => {
        const newFiles = prev.filter((file) => file.id !== fileId);
        if (newFiles.length === 0) {
          setQuizData(null as any);
        }

        return newFiles;
      });
    },
    [setQuizData],
  );

  // Extract existing questions from files (for file-with-answers uploader)
  const extractQuestionsFromFiles = useCallback(
    async (settings?: {
      language?: Language;
      parsingMode?: ParsingMode;
    }) => {
      const successfulFiles = uploadedFiles.filter(
        (f) => f.status === "success" && f.parsedContent,
      );

      if (successfulFiles.length === 0) {
        throw new Error("No files to process");
      }

      let allQuestions: QuestionData[] = [];

      for (const file of successfulFiles) {
        if (file.parsedContent) {
          try {
            // Extract existing questions from file content (NO AI, direct parsing)
            const questions = await extractQuestionsFromContent(
              file.parsedContent,
              settings,
            );
            allQuestions = [...allQuestions, ...questions];
          } catch (error) {
            console.error(
              `Error extracting questions from ${file.name}:`,
              error,
            );
            // Continue with other files even if one fails
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error("No questions could be extracted from files");
      }

      // Update quiz data
      const quizData: GeneratedQuiz = {
        title: `Quiz from ${successfulFiles[0].name}`,
        description: `Extracted ${allQuestions.length} questions from ${successfulFiles.length} file(s)`,
        questions: allQuestions,
      };

      setQuizData(quizData);
      return quizData;
    },
    [uploadedFiles, setQuizData],
  );

  // Generate new questions using AI (for AI-generated uploader)
  const generateQuestionsFromFiles = useCallback(
    async (settings?: {
      visibility?: string;
      language?: string;
      questionType?: string;
      numberOfQuestions?: number;
      mode?: string;
      difficulty?: string;
      task?: string;
      parsingMode?: string;
    }) => {
      const successfulFiles = uploadedFiles.filter(
        (f) => f.status === "success" && f.parsedContent,
      );

      if (successfulFiles.length === 0) {
        throw new Error("No files to process");
      }

      let allQuestions: QuestionData[] = [];

      for (const file of successfulFiles) {
        if (file.parsedContent) {
          try {
            // Generate new questions using AI
            const questions = await generateQuestionsWithAI(
              file.parsedContent,
              settings,
            );
            allQuestions = [...allQuestions, ...questions];
          } catch (error) {
            console.error(
              `Error generating questions from ${file.name}:`,
              error,
            );
            // Continue with other files even if one fails
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error("No questions could be generated from files");
      }

      // Update quiz data
      const quizData: GeneratedQuiz = {
        title: `AI-Generated Quiz from ${successfulFiles[0].name}`,
        description: `Generated from ${successfulFiles.length} file(s) using AI`,
        questions: allQuestions,
      };

      setQuizData(quizData);
      return quizData;
    },
    [uploadedFiles, setQuizData],
  );

  const updateQuizDetails = useCallback(
    (updates: Partial<GeneratedQuiz>) => {
      updateQuizData(updates);
    },
    [updateQuizData],
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setQuizData(null as any);
  }, [setQuizData]);

  // Get current quiz data from store
  const { quizData } = useQuizEditorStore();

  // Update quiz data when files are processed
  useEffect(() => {
    const successfulFiles = uploadedFiles.filter(
      (f) => f.status === "success" && f.extractedQuestions,
    );

    if (successfulFiles.length > 0) {
      const allQuestions = successfulFiles.flatMap(
        (f) => f.extractedQuestions || [],
      );

      setQuizData({
        title: `Quiz from ${successfulFiles.length} file(s)`,
        description: "Auto-generated quiz from uploaded files",
        questions: allQuestions,
      });
    } else if (uploadedFiles.length === 0) {
      // Clear quiz data when no files
      setQuizData(null as any);
    }
  }, [uploadedFiles, setQuizData]);

  return {
    uploadedFiles,
    generatedQuiz: quizData,
    addFiles,
    removeFile,
    extractQuestionsFromFiles,
    generateQuestionsFromFiles,
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!quizData,
  };
}
