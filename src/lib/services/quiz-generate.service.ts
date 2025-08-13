import {} from "@/hooks/quizz";
import {
  extractQuestions,
  extractQuestionsWithAI,
  generateQuestionsFromFile,
  generateQuizTitleDescription as generateTitleDescriptionService,
} from "@/lib/services/ai-llm.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
import {} from "@/stores/quiz-editor-store";
import type { Language, ParsingMode, QuestionData } from "@/types/quiz";
import {} from "react";
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

export const generateQuizTitleDescription = async (
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
export const extractQuestionsFromContent = async (
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
export const extractQuestionsWithAIHandler = async (
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
export const generateQuestionsWithAI = async (
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

  console.log("🚀 Generating new questions with AI (test)...");
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
