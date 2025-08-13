"use client";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { flashcardService } from "@/lib/api/flashcard";
import type { FlashcardSet } from "@/types/flashcard";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ThinLayout from "../layout/thin-layout";
import { FlashcardNavigator } from "./flashcard-navigator";

interface FlashcardStudyViewProps {
  flashcardSetId: number;
}

export function FlashcardStudyView({
  flashcardSetId,
}: FlashcardStudyViewProps) {
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await flashcardService.getFlashcardById(flashcardSetId);
        setFlashcardSet(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load flashcard set",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [flashcardSetId]);

  if (isLoading) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading flashcard set...</span>
          </div>
        </div>
      </ThinLayout>
    );
  }

  if (error) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 font-semibold text-lg">
            Error loading flashcard set
          </h3>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <LocalizedLink href="/flashcards">
            <Button>Back to Flashcards</Button>
          </LocalizedLink>
        </div>
      </ThinLayout>
    );
  }

  if (!flashcardSet) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 font-semibold text-lg">
            Flashcard set not found
          </h3>
          <p className="mb-4 text-muted-foreground">
            The requested flashcard set could not be found.
          </p>
          <LocalizedLink href="/flashcards">
            <Button>Back to Flashcards</Button>
          </LocalizedLink>
        </div>
      </ThinLayout>
    );
  }

  if (!flashcardSet.flashcards || flashcardSet.flashcards.length === 0) {
    return (
      <ThinLayout classNames="flex-1 p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 font-semibold text-lg">No flashcards found</h3>
          <p className="mb-4 text-muted-foreground">
            This flashcard set doesn't contain any cards yet.
          </p>
          <LocalizedLink href="/flashcards">
            <Button>Back to Flashcards</Button>
          </LocalizedLink>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="flex-1 space-y-6 p-6">
      <FlashcardNavigator flashcardSet={flashcardSet} />
    </ThinLayout>
  );
}
