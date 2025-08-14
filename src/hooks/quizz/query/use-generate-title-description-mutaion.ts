import { generateQuizTitleDescription } from "@/lib/services/ai-llm.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGenerateTitleDescriptionMutation() {
  return useMutation({
    mutationKey: ["generate-title-description"],
    mutationFn: async (
      vars: Parameters<typeof generateQuizTitleDescription>[0],
    ) => {
      const res = await generateQuizTitleDescription(vars);
      if (!res.success || !res.title || !res.description)
        throw new Error(
          res.error || "Failed to generate title and description",
        );
      return { title: res.title, description: res.description };
    },
    retry: 2,
    onError: (_err) => {
      toast.error(
        "Generate title and description failed:",
        _err.message as any,
      );
    },
  });
}
