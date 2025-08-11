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
        <div className=" items-start gap-2 rounded-md border border-gray-200 transition-all duration-200 hover:border-gray-300">
          <TiptapEditor
            content={title}
            onChange={onTitleChange}
            placeholder="Enter quiz title"
            showToolbar={true}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
