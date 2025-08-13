import { useAuth } from "@/contexts/auth-context";
import { flashcardService } from "@/lib/api/flashcard";
import type { FlashcardSet, FlashcardStats } from "@/types/flashcard";
import { useCallback, useEffect, useState } from "react";

export function useFlashcards() {
  const { accessToken } = useAuth();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [stats, setStats] = useState<FlashcardStats>({
    totalFlashcards: 0,
    totalDecks: 0,
    averageScore: 0,
    studyTime: "0h",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      setError("No access token available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await flashcardService.getAllFlashcards();
      setFlashcardSets(response.data);

      const calculatedStats = flashcardService.calculateStats(response.data);
      setStats(calculatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcardSets,
    stats,
    isLoading,
    error,
    refetch: fetchFlashcards,
  };
}
