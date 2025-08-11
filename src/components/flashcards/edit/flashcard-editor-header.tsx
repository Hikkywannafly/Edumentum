"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlashcardData, FlashcardSet } from "@/types/flashcard";
import { CheckCircle, Globe, Loader2, Lock, Plus, Save } from "lucide-react";
import { CardHeader, CardTitle } from "../../ui";

interface FlashcardEditorHeaderProps {
  flashcardSet: FlashcardSet;
  title: string;
  description: string;
  flashcards: FlashcardData[];
  isPublic: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onAddFlashcard?: () => void;
  onPrivacyChange?: (isPublic: boolean) => void;
}

export function FlashcardEditorHeader({
  flashcardSet,
  title,
  description,
  flashcards,
  isPublic,
  isSaving = false,
  onSave,
  onPublish,
  onAddFlashcard,
  onPrivacyChange,
}: FlashcardEditorHeaderProps) {
  const hasChanges =
    title !== flashcardSet.title ||
    description !== flashcardSet.description ||
    flashcards.length !== flashcardSet.flashcards.length;

  const canSave = hasChanges && title.trim() !== "";
  const canPublish = canSave && flashcards.length > 0;

  return (
    <div className="sticky top-0 z-10 m-6 border-rounded bg-background shadow-sm">
      <div className="container mx-auto max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle>Edit Flashcard Set</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span>{flashcards.length} cards</span>
              <Select
                value={isPublic ? "public" : "private"}
                onValueChange={(value) => onPrivacyChange?.(value === "public")}
              >
                <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 text-sm">
                  <SelectValue>
                    <div className="flex items-center gap-1">
                      {isPublic ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {isPublic ? "Public" : "Private"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      Public
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={onAddFlashcard}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <Plus className="h-4 w-4" />
              Add Flashcard
            </Button>
            <Button
              variant="outline"
              onClick={onSave}
              disabled={!canSave || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={onPublish}
              disabled={!canPublish || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </CardHeader>
      </div>
    </div>
  );
}
