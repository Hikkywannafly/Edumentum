import {
  ContentExtractor,
  type QuestionData,
} from "@/lib/services/content-extractor.service";
import { FileParserService } from "@/lib/services/file-parser.service";
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
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(
    null,
  );

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

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileInfo.id
              ? {
                  ...file,
                  status: "success",
                  progress: 100,
                  parsedContent: content,
                  extractedQuestions: questions,
                }
              : file,
          ),
        );

        generateQuizFromFiles();
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

  const generateQuizFromFiles = useCallback(() => {
    const successfulFiles = uploadedFiles.filter(
      (f) => f.status === "success" && f.extractedQuestions,
    );

    if (successfulFiles.length === 0) return;

    const allQuestions = successfulFiles.flatMap(
      (f) => f.extractedQuestions || [],
    );

    setGeneratedQuiz({
      title: `Quiz from ${successfulFiles.length} file(s)`,
      description: "Auto-generated quiz from uploaded files",
      questions: allQuestions,
    });
  }, [uploadedFiles]);

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
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      setTimeout(generateQuizFromFiles, 100);
    },
    [generateQuizFromFiles],
  );

  const updateQuizDetails = useCallback((updates: Partial<GeneratedQuiz>) => {
    setGeneratedQuiz((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setGeneratedQuiz(null);
  }, []);

  return {
    uploadedFiles,
    generatedQuiz,
    addFiles,
    removeFile,
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!generatedQuiz,
  };
}
