"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlashcardTitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function FlashcardTitleEditor({
  title,
  onTitleChange,
}: FlashcardTitleEditorProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Flashcard Set Title</CardTitle>
      </CardHeader>
      <CardContent>
        <TiptapEditor
          content={title}
          onChange={onTitleChange}
          placeholder="Enter flashcard set title"
          className="font-medium text-lg"
        />
      </CardContent>
    </Card>
  );
}
