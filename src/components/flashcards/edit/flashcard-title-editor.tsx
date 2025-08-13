"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface FlashcardTitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function FlashcardTitleEditor({
  title,
  onTitleChange,
}: FlashcardTitleEditorProps) {
  const t = useTranslations("Flashcards");
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{t("editPage.flashcardSetTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="items-start gap-2 rounded-md border border-gray-200 transition-all duration-200 hover:border-gray-300">
          <TiptapEditor
            content={title}
            onChange={onTitleChange}
            placeholder="Enter flashcard set title"
            className="font-medium text-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
