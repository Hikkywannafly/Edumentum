"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface QuizDescriptionEditorProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function QuizDescriptionEditor({
  description,
  onDescriptionChange,
}: QuizDescriptionEditorProps) {
  const t = useTranslations("Quizzes.edit");

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{t("quizDescription")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TiptapEditor
          content={description}
          onChange={onDescriptionChange}
          placeholder={t("quizDescription")}
          showToolbar={true}
        />
      </CardContent>
    </Card>
  );
}
