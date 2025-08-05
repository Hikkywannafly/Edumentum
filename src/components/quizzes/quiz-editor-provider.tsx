"use client";

import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useEffect } from "react";

interface QuizEditorProviderProps {
  children: React.ReactNode;
  autoReset?: boolean;
}

export function QuizEditorProvider({
  children,
  autoReset = true,
}: QuizEditorProviderProps) {
  const { reset } = useQuizEditorStore();

  // Reset store when component unmounts (optional)
  useEffect(() => {
    if (autoReset) {
      return () => {
        // Only reset if we're not in the middle of editing
        const { isEditing } = useQuizEditorStore.getState();
        if (!isEditing) {
          reset();
        }
      };
    }
  }, [autoReset, reset]);

  return <>{children}</>;
}
