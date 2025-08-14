import { generateQuizTitleDescription } from "@/lib/services/quiz-generate.service";
import type { QuestionData } from "@/types/quiz";
import { useCallback } from "react";

export function useGenerateTitleDescription() {
  const generateTitleDescription = useCallback(
    async (
      content: string,
      questions: QuestionData[],
      options?: {
        targetLanguage?: string;
        filename?: string;
        category?: string;
        tags?: string[];
      },
    ): Promise<{ title: string; description: string } | null> => {
      const res = await generateQuizTitleDescription(
        content,
        questions,
        options,
      );
      return res; // Now returns { title: string; description: string } | null
    },
    [],
  );

  return { generateTitleDescription };
}
