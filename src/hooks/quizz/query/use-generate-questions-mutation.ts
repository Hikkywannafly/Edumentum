import { generateQuestions } from "@/lib/services/ai-llm.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// Generate NEW questions using AI from content (server-side only)
export function useGenerateQuestionsMutation() {
  return useMutation({
    mutationKey: ["generate-questions"],
    mutationFn: async (
      vars: Parameters<typeof generateQuestions>[0],
      signal?: AbortSignal,
    ) => {
      const res = await generateQuestions(vars, signal);
      if (!res.success || !res.questions)
        throw new Error(res.error || "Failed to generate questions");
      return res.questions;
    },
    retry: 2,
    onError: (err) => {
      toast.error("Generate questions failed:", err.message as any);
    },
  });
}
