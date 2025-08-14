import { generateQuestionsFromFile } from "@/lib/services/ai-llm.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
// Generate NEW questions using AI from content (server-side only)
export function useGenerateQuestionsFromFileMutation() {
  return useMutation({
    mutationKey: ["generate-questions-from-file"],
    mutationFn: async (
      vars: Parameters<typeof generateQuestionsFromFile>[0],
    ) => {
      const res = await generateQuestionsFromFile(vars);
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
