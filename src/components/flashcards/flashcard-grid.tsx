import type { FlashcardSet } from "@/types/flashcard";
import { FlashcardCard } from "./flashcard-card";

interface FlashcardGridProps {
  flashcardSets: FlashcardSet[];
}

export function FlashcardGrid({ flashcardSets }: FlashcardGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {flashcardSets.map((flashcardSet) => (
        <FlashcardCard key={flashcardSet.id} flashcardSet={flashcardSet} />
      ))}
    </div>
  );
}
