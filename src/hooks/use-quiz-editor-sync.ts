import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useEffect, useState } from "react";

export function useQuizEditorSync() {
  const { quizData, updateQuizData } = useQuizEditorStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Sync local state with store data
  useEffect(() => {
    if (quizData) {
      setTitle(quizData.title || "");
      setDescription(quizData.description || "");
    }
  }, [quizData]);

  // Update store when local state changes
  const updateTitle = (newTitle: string) => {
    setTitle(newTitle);
    updateQuizData({ title: newTitle });
  };

  const updateDescription = (newDescription: string) => {
    setDescription(newDescription);
    updateQuizData({ description: newDescription });
  };

  return {
    title,
    description,
    updateTitle,
    updateDescription,
    quizData,
  };
}
