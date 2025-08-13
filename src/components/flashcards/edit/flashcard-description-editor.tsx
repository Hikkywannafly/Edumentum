"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface FlashcardDescriptionEditorProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function FlashcardDescriptionEditor({
  description,
  onDescriptionChange,
}: FlashcardDescriptionEditorProps) {
  const t = useTranslations("Flashcards");
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{t("editPage.description")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="items-start gap-2 rounded-md border border-gray-200 transition-all duration-200 hover:border-gray-300">
          <TiptapEditor
            content={description}
            onChange={onDescriptionChange}
            placeholder="Enter a description for this flashcard set"
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
