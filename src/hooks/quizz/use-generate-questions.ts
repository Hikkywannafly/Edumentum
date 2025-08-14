import { generateQuestionsWithAI } from "@/lib/services/quiz-generate.service";
import type { QuestionData } from "@/types/quiz";
import type { ParsingMode } from "@/types/quiz";
import { useCallback } from "react";

export interface GenerateAISettings {
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

export function useGenerateQuestions() {
  const generate = useCallback(
    async (
      content: string,
      actualFile?: File,
      settings?: GenerateAISettings,
    ): Promise<QuestionData[]> => {
      return await generateQuestionsWithAI(content, actualFile, settings);
    },
    [],
  );

  return { generate };
}
