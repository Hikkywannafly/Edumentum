import { ContentExtractor } from "@/lib/services/content-extractor.service";
import type { QuestionData } from "@/lib/services/content-extractor.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
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

const extractQuestionsWithRules = (content: string): QuestionData[] => {
  const contentExtractor = new ContentExtractor();
  return contentExtractor.extractQuestions(content);
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

  const extractQuestionsFromFiles = useCallback(async () => {
    const successfulFiles = uploadedFiles.filter(
      (f) => f.status === "success" && f.parsedContent,
    );

    if (successfulFiles.length === 0) {
      throw new Error("No files to process");
    }

    let allQuestions: QuestionData[] = [];

    for (const file of successfulFiles) {
      if (file.parsedContent) {
        const questions = extractQuestionsWithRules(file.parsedContent);
        allQuestions = [...allQuestions, ...questions];
      }
    }

    if (allQuestions.length === 0) {
      throw new Error("No questions found in files");
    }

    // Update quiz data
    const quizData: GeneratedQuiz = {
      title: `Quiz from ${successfulFiles[0].name}`,
      description: `Generated from ${successfulFiles.length} file(s)`,
      questions: allQuestions,
    };

    setQuizData(quizData);
    return quizData;
  }, [uploadedFiles, setQuizData]);

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
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!quizData,
  };
}
