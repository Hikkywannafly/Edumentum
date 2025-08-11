import type { QuestionData, QuizSettings } from "@/types/quiz";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuestionData[];
  settings?: QuizSettings;
}

interface QuizEditorState {
  quizData: GeneratedQuiz | null;

  isEditing: boolean;
  isLoading: boolean;

  setQuizData: (quiz: GeneratedQuiz) => void;
  updateQuizData: (updates: Partial<GeneratedQuiz>) => void;
  addQuestion: (question: QuestionData) => void;
  addQuestionAfter: (afterIndex: number, question: QuestionData) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useQuizEditorStore = create<QuizEditorState>()(
  persist(
    (set) => ({
      quizData: null,
      isEditing: false,
      isLoading: false,

      // Actions
      setQuizData: (quiz) => set({ quizData: quiz }),

      updateQuizData: (updates) =>
        set((state) => ({
          quizData: state.quizData ? { ...state.quizData, ...updates } : null,
        })),

      addQuestion: (question) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: [...state.quizData.questions, question],
              }
            : null,
        })),

      addQuestionAfter: (afterIndex, question) =>
        set((state) => {
          if (!state.quizData) return state;

          const questions = [...state.quizData.questions];
          questions.splice(afterIndex + 1, 0, question);

          return {
            quizData: {
              ...state.quizData,
              questions,
            },
          };
        }),

      updateQuestion: (questionId, updates) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: state.quizData.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q,
                ),
              }
            : null,
        })),

      deleteQuestion: (questionId) =>
        set((state) => ({
          quizData: state.quizData
            ? {
                ...state.quizData,
                questions: state.quizData.questions.filter(
                  (q) => q.id !== questionId,
                ),
              }
            : null,
        })),

      moveQuestion: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.quizData) return state;

          const questions = [...state.quizData.questions];
          const [movedQuestion] = questions.splice(fromIndex, 1);
          questions.splice(toIndex, 0, movedQuestion);

          return {
            quizData: {
              ...state.quizData,
              questions,
            },
          };
        }),

      setEditing: (editing) => set({ isEditing: editing }),
      setLoading: (loading) => set({ isLoading: loading }),

      reset: () =>
        set({
          quizData: null,
          isEditing: false,
          isLoading: false,
        }),
    }),
    {
      name: "quiz-editor-storage",
      // Only persist quizData, not UI state
      partialize: (state) => ({ quizData: state.quizData }),
    },
  ),
);
