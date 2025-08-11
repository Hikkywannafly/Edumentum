"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlashcardDescriptionEditorProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function FlashcardDescriptionEditor({
  description,
  onDescriptionChange,
}: FlashcardDescriptionEditorProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <TiptapEditor
          content={description}
          onChange={onDescriptionChange}
          placeholder="Enter a description for this flashcard set"
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}
