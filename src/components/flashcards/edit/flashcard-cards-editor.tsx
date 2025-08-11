"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlashcardData } from "@/types/flashcard";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface FlashcardCardsEditorProps {
  flashcards: FlashcardData[];
  onUpdateFlashcard: (index: number, flashcard: FlashcardData) => void;
  onDeleteFlashcard: (index: number) => void;
  onMoveFlashcard: (fromIndex: number, toIndex: number) => void;
}

interface FlashcardItemProps {
  flashcard: FlashcardData;
  index: number;
  onUpdate: (flashcard: FlashcardData) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function FlashcardItem({
  flashcard,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: FlashcardItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateQuestion = (question: string) => {
    onUpdate({ ...flashcard, question });
  };

  const updateChoice = (choiceIndex: number, value: string) => {
    const newChoices = [...flashcard.choices];
    newChoices[choiceIndex] = value;
    onUpdate({ ...flashcard, choices: newChoices });
  };

  const updateCorrectAnswer = (correctAnswer: number) => {
    onUpdate({ ...flashcard, correctAnswer });
  };

  const updateExplanation = (explanation: string) => {
    onUpdate({ ...flashcard, explanation });
  };

  return (
    <Card className="border">
      <CardHeader
        className="cursor-pointer pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Card {index + 1}
            {flashcard.question && (
              <span className="ml-2 font-normal text-muted-foreground text-sm">
                {flashcard.question.substring(0, 50)}
                {flashcard.question.length > 50 ? "..." : ""}
              </span>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <CardTitle className="font-medium text-lg">Question</CardTitle>
            <TiptapEditor
              content={flashcard.question}
              onChange={updateQuestion}
              placeholder="Enter the question"
              showToolbar={true}
            />
          </div>

          {/* Choices */}
          <div className="space-y-2">
            <CardTitle className="font-medium text-lg">
              Answer Choices
            </CardTitle>
            <div className="space-y-2">
              {flashcard.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex items-center gap-2">
                  <span className="w-6 font-medium text-lg">
                    {String.fromCharCode(65 + choiceIndex)}:
                  </span>
                  <div className="flex-1">
                    <TiptapEditor
                      content={choice}
                      onChange={(value) => updateChoice(choiceIndex, value)}
                      placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <CardTitle className="font-medium text-lg">
              Correct Answer
            </CardTitle>
            <Select
              value={flashcard.correctAnswer.toString()}
              onValueChange={(value) =>
                updateCorrectAnswer(Number.parseInt(value, 10))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {flashcard.choices.map((choice, choiceIndex) => (
                  <SelectItem key={choiceIndex} value={choiceIndex.toString()}>
                    {String.fromCharCode(65 + choiceIndex)}:{" "}
                    {choice || `Choice ${choiceIndex + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <CardTitle className="font-medium text-lg">
              Explanation (Optional)
            </CardTitle>
            <TiptapEditor
              content={flashcard.explanation}
              onChange={updateExplanation}
              placeholder="Explain why this is the correct answer"
              showToolbar={true}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function FlashcardCardsEditor({
  flashcards,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onMoveFlashcard,
}: FlashcardCardsEditorProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Flashcards ({flashcards.length})</CardTitle>
      </CardHeader>

      {flashcards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No flashcards yet. Click "Add Flashcard" to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <CardContent className="space-y-6">
            {flashcards.map((flashcard, index) => (
              <FlashcardItem
                key={flashcard.id}
                flashcard={flashcard}
                index={index}
                onUpdate={(updatedFlashcard) =>
                  onUpdateFlashcard(index, updatedFlashcard)
                }
                onDelete={() => onDeleteFlashcard(index)}
                onMoveUp={() => onMoveFlashcard(index, index - 1)}
                onMoveDown={() => onMoveFlashcard(index, index + 1)}
                canMoveUp={index > 0}
                canMoveDown={index < flashcards.length - 1}
              />
            ))}
          </CardContent>
        </div>
      )}
    </Card>
  );
}
