// import { useGenerateQuestionsFromFileMutation, useGenerateQuestionsMutation } from "@/hooks/quizz";
import {
  extractQuestionsWithAI,
  generateQuestions,
  // generateQuestionsFromFile,
} from "@/lib/services/ai-llm.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import {
  extractQuestionsFromContent,
  extractQuestionsWithAIHandler,
  generateQuestionsWithAI,
  generateQuizTitleDescription,
} from "@/lib/services/quiz-generate.service";
// import { fileToAIService } from "@/lib/services/file-to-ai.service";
import {
  type GeneratedQuiz,
  useQuizEditorStore,
} from "@/stores/quiz-editor-store";
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
  actualFile?: File;
}

const fileParser = new FileParserService();
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
                  actualFile, // Store the actual file for direct sending
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

      // Process files concurrently for faster UX
      await Promise.all(
        newFiles.map((file, idx) => processFile(file, acceptedFiles[idx])),
      );
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
      generationMode?: "GENERATE" | "EXTRACT";
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
            let questions: QuestionData[] = [];

            if (settings?.generationMode === "EXTRACT") {
              // Extract existing questions using AI (not regex)
              questions = await extractQuestionsWithAIHandler(
                file.parsedContent,
                file.actualFile, // Pass the actual file for direct sending option
                settings,
              );
            } else {
              // Generate new questions using AI (default mode)
              questions = await generateQuestionsWithAI(
                file.parsedContent,
                file.actualFile, // Pass the actual file for direct sending option
                settings,
              );
            }

            allQuestions = [...allQuestions, ...questions];
          } catch (error) {
            console.error(
              `Error ${settings?.generationMode === "EXTRACT" ? "extracting" : "generating"} questions from ${file.name}:`,
              error,
            );
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error(
          settings?.generationMode === "EXTRACT"
            ? "No questions could be extracted from files"
            : "No questions could be generated from files",
        );
      }

      // Update quiz data with AI-selected category
      const isExtractMode = settings?.generationMode === "EXTRACT";

      let selectedCategory: string | undefined;
      const allTags: string[] = [];

      // Extract metadata from generated questions
      for (const question of allQuestions) {
        if (question.tags) {
          for (const tag of question.tags) {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          }
        }
      }

      // Generate AI-powered title and description
      let aiTitle = "";
      let aiDescription = "";
      try {
        const firstFile = successfulFiles[0];
        const contentPreview = firstFile.parsedContent?.slice(0, 1000) || "";

        // Let AI generate contextual title and description
        const titleDescResult = await generateQuizTitleDescription(
          contentPreview,
          allQuestions,
          isExtractMode,
          {
            targetLanguage: settings?.language || "vi",
            filename: firstFile?.name,
            category: selectedCategory,
            tags: allTags,
          },
        );

        if (titleDescResult.success) {
          aiTitle = titleDescResult.title || "";
          aiDescription = titleDescResult.description || "";
        }
      } catch (error) {
        console.warn("Failed to generate AI title/description:", error);
      }

      const quizData: GeneratedQuiz = {
        title:
          aiTitle ||
          (isExtractMode
            ? `Extracted Quiz from ${successfulFiles[0].name}`
            : `AI-Generated Quiz from ${successfulFiles[0].name}`),
        description:
          aiDescription ||
          (isExtractMode
            ? `Extracted ${allQuestions.length} questions from ${successfulFiles.length} file(s)`
            : `Generated from ${successfulFiles.length} file(s) using AI`),
        questions: allQuestions,
        metadata: {
          total_questions: allQuestions.length,
          total_points: allQuestions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.max(5, Math.ceil(allQuestions.length * 1.5)), // 1.5 minutes per question
          tags: allTags.slice(0, 10), // Limit to first 10 unique tags
          category: selectedCategory,
        },
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

  // Extract existing questions directly from TEXT content (no AI)
  const extractQuestionsFromText = useCallback(
    async (
      content: string,
      settings?: {
        language?: Language;
        parsingMode?: ParsingMode;
      },
    ) => {
      if (!content || content.trim().length === 0) {
        throw new Error("No text content provided");
      }

      const questions = await extractQuestionsFromContent(content, settings);

      const quizData: GeneratedQuiz = {
        title: "Quiz from Text Content",
        description: `Extracted ${questions.length} questions from text`,
        questions,
      };

      setQuizData(quizData);
      return quizData;
    },
    [setQuizData],
  );

  // Generate new questions directly from TEXT content (AI)
  const generateQuestionsFromText = useCallback(
    async (
      content: string,
      settings?: {
        generationMode?: "GENERATE" | "EXTRACT";
        visibility?: string;
        language?: string;
        questionType?: string;
        numberOfQuestions?: number;
        mode?: string;
        difficulty?: string;
        task?: string;
        parsingMode?: string;
        includeCategories?: boolean;
      },
    ) => {
      if (!content || content.trim().length === 0) {
        throw new Error("No text content provided");
      }

      const result: any =
        settings?.generationMode === "EXTRACT"
          ? await extractQuestionsWithAI({
              questionHeader: "Extract Questions",
              questionDescription: "Extract questions from content",
              apiKey: "", // Will be handled server-side
              fileContent: content,
              settings: {
                ...settings,
                includeCategories: true,
              },
            })
          : await generateQuestions({
              questionHeader: "Generate Questions",
              questionDescription: "Generate questions from content",
              apiKey: "", // Will be handled server-side
              fileContent: content,
              settings: {
                ...settings,
                includeCategories: true,
              },
            });

      const questions = Array.isArray(result) ? result : result.questions || [];
      const selectedCategory = result.selectedCategory;

      // Collect unique tags from all questions
      const allTags: string[] = [];
      for (const q of questions) {
        if (q.tags) {
          for (const tag of q.tags) {
            if (!allTags.includes(tag)) {
              allTags.push(tag);
            }
          }
        }
      }

      const isExtractMode = settings?.generationMode === "EXTRACT";
      const quizData: GeneratedQuiz = {
        title: isExtractMode
          ? "Extracted Quiz from Text"
          : "AI-Generated Quiz from Text",
        description: isExtractMode
          ? `Extracted ${questions.length} questions from text`
          : `Generated ${questions.length} questions from text using AI`,
        questions,
        metadata: {
          total_questions: questions.length,
          total_points: questions.reduce(
            (sum: number, q: QuestionData) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.max(5, Math.ceil(questions.length * 1.5)), // 1.5 minutes per question
          tags: allTags.slice(0, 10), // Limit to first 10 unique tags
          category: selectedCategory,
          subject: settings?.language,
        },
      };

      setQuizData(quizData);
      return quizData;
    },
    [setQuizData],
  );

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setQuizData(null as any);
  }, [setQuizData]);

  const { quizData } = useQuizEditorStore();

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
      setQuizData(null as any);
    }
  }, [uploadedFiles, setQuizData]);

  // imp react-query
  // const generateQuestionsMutation = useGenerateQuestionsMutation();
  // const generateQuestionsFromFileMutation = useGenerateQuestionsFromFileMutation();

  // const generateQuestionsWithAI_Temp = useCallback(
  //   async (
  //     content: string,
  //     actualFile?: File,
  //     settings?: {
  //       fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
  //       visibility?: string;
  //       language?: string;
  //       questionType?: string;
  //       numberOfQuestions?: number;
  //       mode?: string;
  //       difficulty?: string;
  //       task?: string;
  //       parsingMode?: string;
  //       includeCategories?: boolean;
  //     },
  //   ): Promise<QuestionData[]> => {
  //     const isDirectMode = settings?.fileProcessingMode === "SEND_DIRECT";
  //     const numberOfQuestions = settings?.numberOfQuestions || 5;
  //     console.log(isDirectMode, numberOfQuestions);

  //     if (isDirectMode && actualFile) {
  //       const validation = fileToAIService.validateFileForAI(actualFile);
  //       if (!validation.valid) {
  //         console.warn("⚠️ File not supported for direct sending:", validation.error);
  //       } else {
  //         const fileForAI = await fileToAIService.convertFileToAI(actualFile);
  //         const questions = await generateQuestionsFromFile({
  //           questionHeader: "Generate Quiz Questions",
  //           questionDescription: "Generate new quiz questions from the provided file.",
  //           apiKey: "",
  //           file: fileForAI,
  //           settings: { ...settings, numberOfQuestions, includeCategories: true },
  //           useMultiAgent: settings?.parsingMode === "THOROUGH",
  //         });
  //         return questions.questions as QuestionData[];
  //       }
  //     }

  //     const questions = await generateQuestions({
  //       questionHeader: "Generate Quiz Questions",
  //       questionDescription: "Generate new quiz questions from the provided file.",
  //       apiKey: "",
  //       fileContent: content,
  //       settings: { ...settings, numberOfQuestions, includeCategories: true },
  //       useMultiAgent: settings?.parsingMode === "THOROUGH",
  //     });
  //     return questions.questions as QuestionData[];
  //   }
  // )

  return {
    uploadedFiles,
    generatedQuiz: quizData,
    addFiles,
    removeFile,
    extractQuestionsFromFiles,
    generateQuestionsFromFiles,
    extractQuestionsFromText,
    generateQuestionsFromText,
    updateQuizDetails,
    reset,
    isProcessing: uploadedFiles.some(
      (f) => f.status === "uploading" || f.status === "processing",
    ),
    hasFiles: uploadedFiles.length > 0,
    hasGeneratedQuiz: !!quizData,
  };
}
