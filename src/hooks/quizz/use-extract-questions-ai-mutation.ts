import { extractQuestionsWithAI } from "@/lib/services/ai-llm.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// Extract questions using AI (for content that already has quiz format)
export function useExtractQuestionsAiMutation() {
  return useMutation({
    mutationKey: ["extract-questions-ai"],
    mutationFn: async (vars: Parameters<typeof extractQuestionsWithAI>[0]) => {
      const res = await extractQuestionsWithAI(vars);
      if (!res.success || !res.questions)
        throw new Error(res.error || "Failed to extract questions");
      return res.questions;
    },
    retry: 2,
    onError: (err) => {
      toast.error("Extract questions failed:", err.message as any);
    },
  });
}
