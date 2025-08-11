"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface QuizEditorHeaderProps {
  onSave: () => void;
  onCreateQuiz: () => void;
  canSave: boolean;
  canCreate: boolean;
}

export function QuizEditorHeader({
  onSave,
  onCreateQuiz,
  canSave,
  canCreate,
}: QuizEditorHeaderProps) {
  return (
    <div className=" flex w-full items-center justify-end p-4">
      <div className="pb- flex w-full gap-2 border-gray-200 border-b-1 p-2">
        <Button onClick={onSave} disabled={!canSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={onCreateQuiz} disabled={!canCreate}>
          <Save className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      </div>
    </div>
  );
}
