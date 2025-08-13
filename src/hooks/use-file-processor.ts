import {
  extractQuestions,
  extractQuestionsWithAI,
  generateQuestions,
  generateQuestionsFromFile,
  generateQuizTitleDescription as generateTitleDescriptionService,
} from "@/lib/services/ai-llm.service";
import { FileParserService } from "@/lib/services/file-parser.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
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

const generateQuizTitleDescription = async (
  content: string,
  questions: QuestionData[],
  isExtractMode: boolean,
  options?: {
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  },
): Promise<{
  success: boolean;
  title?: string;
  description?: string;
  error?: string;
}> => {
  return generateTitleDescriptionService({
    content,
    questions,
    isExtractMode,
    targetLanguage: options?.targetLanguage || "vi",
    filename: options?.filename,
    category: options?.category,
    tags: options?.tags,
  });
};

// Extract questions from file content (for files with existing questions - NO AI)
const extractQuestionsFromContent = async (
  content: string,
  settings?: {
    language?: Language;
    parsingMode?: ParsingMode;
    fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
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

// Extract EXISTING questions using AI (for quiz extraction)
const extractQuestionsWithAIHandler = async (
  content: string,
  actualFile?: File,
  settings?: {
    fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
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
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  console.log("🔍 Extracting existing questions with AI...");
  console.log("🔧 Settings:", settings);
  console.log("📄 Content length:", content.length);

  const maxRetries = 3;
  let lastError: Error | null = null;
  const isDirectMode = settings?.fileProcessingMode === "SEND_DIRECT";

  // Validate file for direct sending if needed, auto-fallback to parse mode
  let actualMode = isDirectMode;
  if (isDirectMode && actualFile) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (!validation.valid) {
      console.warn(
        `⚠️ File not supported for direct sending: ${validation.error}`,
      );
      console.log("🔄 Auto-fallback to 'Parse Then Send' mode for extraction");
      actualMode = false;
    } else {
      console.log("✅ File validated for direct AI extraction");
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📡 Attempt ${attempt}/${maxRetries} - Calling AI extraction service (${actualMode ? "DIRECT" : "PARSED"} mode)...`,
      );

      let result: any;

      if (actualMode && actualFile) {
        console.log(" Converting file for direct AI extraction...");
        const fileForAI = await fileToAIService.convertFileToAI(actualFile);

        result = await extractQuestionsWithAI({
          questionHeader: "Extract Quiz Questions",
          questionDescription:
            "Extract existing quiz questions from the provided file.",
          apiKey,
          file: fileForAI,
          settings: {
            ...settings,
            numberOfQuestions: settings?.numberOfQuestions || 10, // Higher default for extraction
            includeCategories: true,
          },
          useMultiAgent: settings?.parsingMode === "THOROUGH",
        });
      } else {
        result = await extractQuestionsWithAI({
          questionHeader: "Extract Quiz Questions",
          questionDescription:
            "Extract existing quiz questions from the provided content.",
          apiKey,
          fileContent: content,
          settings: {
            ...settings,
            numberOfQuestions: settings?.numberOfQuestions || 10,
            includeCategories: true, // Enable AI category selection
          },
          useMultiAgent: settings?.parsingMode === "THOROUGH",
        });
      }

      if (result.success && result.questions && result.questions.length > 0) {
        console.log(
          `Successfully extracted ${result.questions.length} questions on attempt ${attempt}`,
        );

        // Validate questions have proper structure
        const validQuestions = result.questions.filter(
          (q: QuestionData) =>
            q.question &&
            q.question.trim().length > 0 &&
            q.answers &&
            q.answers.length > 0,
        );

        if (validQuestions.length === 0) {
          throw new Error("Extracted questions are empty or invalid");
        }

        return validQuestions;
      }

      throw new Error(result.error || "AI service returned no questions");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `❌ Extraction attempt ${attempt}/${maxRetries} failed:`,
        lastError.message,
      );

      // Don't retry on quota exhaustion or invalid API key - these won't be fixed by retrying
      const isQuotaExhausted =
        lastError.message.includes("OpenRouter Quota Exhausted") ||
        lastError.message.includes("insufficient_quota");
      const isInvalidApiKey = lastError.message.includes("Invalid API key");

      if (isQuotaExhausted || isInvalidApiKey) {
        console.error(
          `❌ ${isQuotaExhausted ? "Quota exhausted" : "Invalid API key"} - stopping retries`,
        );
        break;
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${attempt} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw new Error(
    `Failed to extract questions after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`,
  );
};

// Generate new questions directly from TEXT content (AI)
const generateQuestionsWithAI = async (
  content: string,
  actualFile?: File,
  settings?: {
    fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
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
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  console.log("🚀 Generating new questions with AI...");
  console.log("🔧 Settings:", settings);
  console.log("📄 Content length:", content.length);

  const maxRetries = 3;
  let lastError: Error | null = null;
  const isDirectMode = settings?.fileProcessingMode === "SEND_DIRECT";

  // Validate file for direct sending if needed, auto-fallback to parse mode
  let actualMode = isDirectMode;
  if (isDirectMode && actualFile) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (!validation.valid) {
      console.warn(
        `⚠️ File not supported for direct sending: ${validation.error}`,
      );
      console.log("🔄 Auto-fallback to 'Parse Then Send' mode for generation");
      actualMode = false; // Fallback to parse mode
    } else {
      console.log("File validated for direct AI generation");
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📡 Attempt ${attempt}/${maxRetries} - Calling AI service (${actualMode ? "DIRECT" : "PARSED"} mode)...`,
      );

      let result: any;

      if (actualMode && actualFile) {
        // Convert file to AI format and send directly
        console.log("🔄 Converting file for direct AI processing...");
        const fileForAI = await fileToAIService.convertFileToAI(actualFile);

        result = await generateQuestionsFromFile({
          questionHeader: "Generate Quiz Questions",
          questionDescription:
            "Generate new quiz questions from the provided file.",
          apiKey,
          file: fileForAI,
          settings: {
            ...settings,
            numberOfQuestions: settings?.numberOfQuestions || 5,
            includeCategories: true, // Enable AI category selection
          },
          useMultiAgent: settings?.parsingMode === "THOROUGH",
        });
      } else {
        // Use traditional text-based approach
        console.log("🔄 Using text-based AI processing...");
        const { generateQuestions } = await import(
          "@/lib/services/ai-llm.service"
        );

        result = await generateQuestions({
          questionHeader: "Generate Quiz Questions",
          questionDescription:
            "Generate new quiz questions from the provided content.",
          apiKey,
          fileContent: content,
          settings: {
            ...settings,
            numberOfQuestions: settings?.numberOfQuestions || 5,
            includeCategories: true,
          },
          useMultiAgent: settings?.parsingMode === "THOROUGH",
        });
      }

      if (result.success && result.questions && result.questions.length > 0) {
        console.log(
          `✅ Successfully generated ${result.questions.length} questions on attempt ${attempt}`,
        );

        // Validate questions have proper structure
        const validQuestions = result.questions.filter(
          (q: QuestionData) =>
            q.question &&
            q.question.trim().length > 0 &&
            q.answers &&
            q.answers.length > 0,
        );

        if (validQuestions.length === 0) {
          throw new Error("Generated questions are empty or invalid");
        }

        const expectedCount = settings?.numberOfQuestions || 5;
        if (validQuestions.length < expectedCount) {
          console.warn(
            `⚠️ Got ${validQuestions.length}/${expectedCount} questions. Returning partial results without retry.`,
          );
        }

        console.log(
          ` Validated ${validQuestions.length} questions (expected: ${expectedCount})`,
        );
        return validQuestions;
      }

      throw new Error(result.error || "AI service returned no questions");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);

      const isQuotaExhausted =
        lastError.message.includes("OpenRouter Quota Exhausted") ||
        lastError.message.includes("insufficient_quota");
      const isInvalidApiKey = lastError.message.includes("Invalid API key");
      const isNetworkError =
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("ENOTFOUND") ||
        lastError.message.includes("503") ||
        lastError.message.includes("502");
      const isRateLimit =
        lastError.message.includes("429") && !isQuotaExhausted;

      // Only retry for network/server errors, not for quota/auth/content issues
      if (isQuotaExhausted || isInvalidApiKey) {
        console.error(
          `❌ ${isQuotaExhausted ? "Quota exhausted" : "Invalid API key"} - stopping retries`,
        );
        break;
      }

      // Only retry for network/server errors
      if ((isNetworkError || isRateLimit) && attempt < maxRetries) {
        const delay = attempt * 1000;
        console.log(`🔄 Retrying network error in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (attempt < maxRetries) {
        console.warn(`⚠️ Non-retryable error: ${lastError.message}`);
        break; // Don't retry content/parse errors
      }
    }
  }
  const errorMessage = `Failed to generate questions after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`;
  console.error("❌", errorMessage);
  throw new Error(errorMessage);
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
            // Continue with other files even if one fails
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
