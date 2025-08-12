"use client";

import ThinLayout from "@/components/layout/thin-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";
import { flashcardService } from "@/lib/services/flashcard.service";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import type { FlashcardData, FlashcardSet } from "@/types/flashcard";
import { useEffect, useState } from "react";
import { FlashcardCardsEditor } from "./flashcard-cards-editor";
import { FlashcardDescriptionEditor } from "./flashcard-description-editor";
import { FlashcardEditorHeader } from "./flashcard-editor-header";
import { FlashcardTitleEditor } from "./flashcard-title-editor";

interface FlashcardEditorContentProps {
  flashcardSetId: string;
}

export function FlashcardEditorContent({
  flashcardSetId,
}: FlashcardEditorContentProps) {
  const { accessToken } = useAuth();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { goFlashcards } = useLocalizedNavigation();

  // Local state for editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (!accessToken) {
        setError("No access token provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await flashcardService.getFlashcardById(
          Number.parseInt(flashcardSetId, 10),
          accessToken,
        );

        setFlashcardSet(data);
        setTitle(data.title);
        setDescription(data.description);
        setFlashcards(data.flashcards);
        setIsPublic(data.isPublic);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load flashcard set",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [flashcardSetId, accessToken]);

  const addFlashcard = () => {
    const newFlashcard: FlashcardData = {
      id: Date.now(), // Temporary ID
      question: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
    setFlashcards([...flashcards, newFlashcard]);
  };

  const updateFlashcard = (index: number, updatedFlashcard: FlashcardData) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index] = updatedFlashcard;
    setFlashcards(newFlashcards);
  };

  const deleteFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const moveFlashcard = (fromIndex: number, toIndex: number) => {
    const newFlashcards = [...flashcards];
    const [removed] = newFlashcards.splice(fromIndex, 1);
    newFlashcards.splice(toIndex, 0, removed);
    setFlashcards(newFlashcards);
  };

  const handleSave = async () => {
    if (!flashcardSet || !accessToken) return;

    try {
      setIsSaving(true);

      const updatedFlashcardSet = {
        title,
        description,
        flashcards,
        isPublic,
      };

      const result = await flashcardService.updateFlashcardSet(
        flashcardSet.id,
        updatedFlashcardSet,
        accessToken,
      );

      // Update the local state with the result
      setFlashcardSet(result);
      console.log("✅ Flashcard set saved successfully");
    } catch (err) {
      console.error("❌ Error saving flashcard set:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save flashcard set",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!flashcardSet || !accessToken) return;

    try {
      setIsSaving(true);

      const updatedFlashcardSet = {
        title,
        description,
        flashcards,
        isPublic: true, // Force public when publishing
      };

      const result = await flashcardService.updateFlashcardSet(
        flashcardSet.id,
        updatedFlashcardSet,
        accessToken,
      );

      // Update the local state with the result
      setFlashcardSet(result);
      setIsPublic(true);
      console.log("✅ Flashcard set published successfully");
    } catch (err) {
      console.error("❌ Error publishing flashcard set:", err);
      setError(
        err instanceof Error ? err.message : "Failed to publish flashcard set",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!flashcardSet || !accessToken) return;

    try {
      setIsSaving(true);
      setShowDeleteDialog(false);

      await flashcardService.deleteFlashcardSet(flashcardSet.id, accessToken);

      // Redirect to flashcards page after successful deletion
      goFlashcards();
    } catch (err) {
      console.error("❌ Error deleting flashcard set:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete flashcard set",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThinLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading flashcard set...</div>
        </div>
      </ThinLayout>
    );
  }

  if (error) {
    return (
      <ThinLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </ThinLayout>
    );
  }

  if (!flashcardSet) {
    return (
      <ThinLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">
            No flashcard set found. Please go back and try again.
          </div>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout>
      <div className="space-y-6">
        <FlashcardEditorHeader
          flashcardSet={flashcardSet}
          title={title}
          description={description}
          flashcards={flashcards}
          isPublic={isPublic}
          isSaving={isSaving}
          onAddFlashcard={addFlashcard}
          onSave={handleSave}
          onPublish={handlePublish}
          onDelete={handleDelete}
          onPrivacyChange={setIsPublic}
        />

        <div className="space-y-4">
          <FlashcardTitleEditor title={title} onTitleChange={setTitle} />

          <FlashcardDescriptionEditor
            description={description}
            onDescriptionChange={setDescription}
          />
        </div>

        <FlashcardCardsEditor
          flashcards={flashcards}
          onUpdateFlashcard={updateFlashcard}
          onDeleteFlashcard={deleteFlashcard}
          onMoveFlashcard={moveFlashcard}
          onAddFlashcard={addFlashcard}
        />
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flashcard Set</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard set? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThinLayout>
  );
}
