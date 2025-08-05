import {
  ContentExtractor,
  type QuestionData,
} from "@/lib/services/content-extractor.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useCallback, useState } from "react";

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
const contentExtractor = new ContentExtractor();

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
        const questions = contentExtractor.extractQuestions(content);

        setUploadedFiles((prev) => {
          const updatedFiles = prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "success" as const,
                  progress: 100,
                  parsedContent: content,
                  extractedQuestions: questions,
                }
              : file,
          );

          // Generate quiz after updating files
          const successfulFiles = updatedFiles.filter(
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
          }

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
    [setQuizData],
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

  return {
    uploadedFiles,
    generatedQuiz: quizData,
    addFiles,
    removeFile,
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!quizData,
  };
}
