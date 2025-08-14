import { extractQuestionsFromContent } from "@/lib/services/quiz-generate.service";
import type { Language, ParsingMode, QuestionData } from "@/types/quiz";
import { useCallback } from "react";

export interface ExtractSettings {
  language?: Language;
  parsingMode?: ParsingMode;
}

export function useExtractQuestions() {
  const extract = useCallback(
    async (
      content: string,
      settings?: ExtractSettings,
    ): Promise<QuestionData[]> => {
      return await extractQuestionsFromContent(content, settings);
    },
    [],
  );

  return { extract };
}
