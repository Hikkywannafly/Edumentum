"use client";

import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizTitleEditorProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function QuizTitleEditor({
  title,
  onTitleChange,
}: QuizTitleEditorProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Quiz Title</CardTitle>
      </CardHeader>
      <CardContent>
        <TiptapEditor
          content={title}
          onChange={onTitleChange}
          placeholder="Enter quiz title"
          showToolbar={true}
        />
      </CardContent>
    </Card>
  );
}
