"use client";

import { Button } from "@/components/ui/button";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { ArrowLeft, Save } from "lucide-react";

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
  const { goQuizzes } = useLocalizedNavigation();

  const handleBack = () => {
    goQuizzes();
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <h1 className="font-bold text-2xl">Edit Quiz</h1>
      </div>
      <div className="flex gap-2">
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
