import {
  extractQuestions,
  extractQuestionsWithAI,
  generateQuestions,
  generateQuestionsFromFile,
  generateQuizTitleDescription as generateTitleDescriptionService,
} from "@/lib/services/ai-llm.service";
import { fileToAIService } from "@/lib/services/file-to-ai.service";
import type { Language, ParsingMode, QuestionData } from "@/types/quiz";

// Utility function to determine useMultiAgent based on parsingMode
function shouldUseMultiAgent(parsingMode?: ParsingMode): boolean {
  return parsingMode === "THOROUGH";
}

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

// Orchestration function for quiz title/description generation
export const generateQuizTitleDescription = async (
  content: string,
  questions: QuestionData[],
  options?: {
    isExtractMode?: boolean;
    targetLanguage?: string;
    filename?: string;
    category?: string;
    tags?: string[];
  },
): Promise<{ title: string; description: string } | null> => {
  try {
    const result = await generateTitleDescriptionService({
      content,
      questions,

      isExtractMode: options?.isExtractMode ?? false,
      targetLanguage: options?.targetLanguage || "auto",
      filename: options?.filename,
      category: options?.category,
      tags: options?.tags,
    });

    if (result.success && result.title && result.description) {
      return {
        title: result.title,
        description: result.description,
      };
    }
    return null;
  } catch (error) {
    console.warn("Failed to generate title/description:", error);
    return null;
  }
};

// Orchestration function for direct question extraction (NO AI)
export const extractQuestionsFromContent = async (
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

// Orchestration function for AI-based question extraction
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
    parsingMode?: ParsingMode;
    includeCategories?: boolean;
  },
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  // Determine processing mode
  const isDirectMode =
    settings?.fileProcessingMode === "SEND_DIRECT" && actualFile;
  let useDirectMode = false;

  if (isDirectMode) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (validation.valid) {
      useDirectMode = true;
    }
  }

  try {
    let result: {
      success: boolean;
      questions?: QuestionData[];
      error?: string;
    };

    if (useDirectMode && actualFile) {
      const fileForAI = await fileToAIService.convertFileToAI(actualFile);
      result = await extractQuestionsWithAI({
        questionHeader: "Extract Quiz Questions",
        questionDescription:
          "Extract existing quiz questions from the provided file.",
        apiKey,
        file: fileForAI,
        settings: {
          ...settings,
          numberOfQuestions: settings?.numberOfQuestions || 10,
          includeCategories: true,
        },
        useMultiAgent: shouldUseMultiAgent(settings?.parsingMode),
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
          includeCategories: true,
        },
        useMultiAgent: shouldUseMultiAgent(settings?.parsingMode),
      });
    }

    if (!result.success || !result.questions || result.questions.length === 0) {
      throw new Error(result.error || "No questions could be extracted");
    }

    // Validate question structure
    const validQuestions = result.questions.filter(
      (q: QuestionData) =>
        q.question?.trim() && q.answers && q.answers.length > 0,
    );

    if (validQuestions.length === 0) {
      throw new Error("Extracted questions are invalid or empty");
    }
    return validQuestions;
  } catch (error) {
    console.error("❌ AI extraction failed:", error);
    throw error;
  }
};

// Orchestration function for AI-based question generation
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
    parsingMode?: ParsingMode;
    includeCategories?: boolean;
  },
): Promise<QuestionData[]> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  // Determine processing mode
  const isDirectMode =
    settings?.fileProcessingMode === "SEND_DIRECT" && actualFile;
  let useDirectMode = false;

  if (isDirectMode) {
    const validation = fileToAIService.validateFileForAI(actualFile);
    if (validation.valid) {
      useDirectMode = true;
    }
  }

  try {
    let result: {
      success: boolean;
      questions?: QuestionData[];
      error?: string;
    };

    if (useDirectMode && actualFile) {
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
          includeCategories: true,
        },
        useMultiAgent: shouldUseMultiAgent(settings?.parsingMode),
      });
    } else {
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
        useMultiAgent: shouldUseMultiAgent(settings?.parsingMode),
      });
    }

    if (!result.success || !result.questions || result.questions.length === 0) {
      throw new Error(result.error || "No questions could be generated");
    }

    // Validate question structure
    const validQuestions = result.questions.filter(
      (q: QuestionData) =>
        q.question?.trim() && q.answers && q.answers.length > 0,
    );

    if (validQuestions.length === 0) {
      throw new Error("Generated questions are invalid or empty");
    }

    const expectedCount = settings?.numberOfQuestions || 5;
    if (validQuestions.length < expectedCount) {
      console.warn(
        `⚠️ Got ${validQuestions.length}/${expectedCount} questions. Returning partial results.`,
      );
    }
    return validQuestions;
  } catch (error) {
    console.error("❌ AI generation failed:", error);
    throw error;
  }
};
