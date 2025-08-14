import { extractQuestionsWithAIHandler } from "@/lib/services/quiz-generate.service";
import type { QuestionData } from "@/types/quiz";
import type { ParsingMode } from "@/types/quiz";
import { useCallback } from "react";

export interface ExtractAISettings {
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
}

export function useExtractQuestionsAI() {
  const extractAI = useCallback(
    async (
      content: string,
      actualFile?: File,
      settings?: ExtractAISettings,
    ): Promise<QuestionData[]> => {
      return await extractQuestionsWithAIHandler(content, actualFile, settings);
    },
    [],
  );

  return { extractAI };
}
