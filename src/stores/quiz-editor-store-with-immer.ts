import type { QuestionData } from "@/types/quiz";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuestionData[];
}

interface QuizEditorState {
  // Quiz data
  quizData: GeneratedQuiz | null;

  // UI state
  isEditing: boolean;
  isLoading: boolean;

  // Actions
  setQuizData: (quiz: GeneratedQuiz) => void;
  updateQuizData: (updates: Partial<GeneratedQuiz>) => void;
  addQuestion: (question: QuestionData) => void;
  updateQuestion: (questionId: string, updates: Partial<QuestionData>) => void;
  deleteQuestion: (questionId: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Zustand  Immer
export const useQuizEditorStoreWithImmer = create<QuizEditorState>()(
  immer((set) => ({
    // Initial state
    quizData: null,
    isEditing: false,
    isLoading: false,

    // Actions
    setQuizData: (quiz) =>
      set((state) => {
        state.quizData = quiz;
      }),

    updateQuizData: (updates) =>
      set((state) => {
        if (state.quizData) {
          Object.assign(state.quizData, updates);
        }
      }),

    addQuestion: (question) =>
      set((state) => {
        if (state.quizData) {
          state.quizData.questions.push(question);
        }
      }),

    updateQuestion: (questionId, updates) =>
      set((state) => {
        if (state.quizData) {
          const question = state.quizData.questions.find(
            (q: QuestionData) => q.id === questionId,
          );
          if (question) {
            Object.assign(question, updates);
          }
        }
      }),

    deleteQuestion: (questionId) =>
      set((state) => {
        if (state.quizData) {
          const index = state.quizData.questions.findIndex(
            (q: QuestionData) => q.id === questionId,
          );
          if (index !== -1) {
            state.quizData.questions.splice(index, 1);
          }
        }
      }),

    moveQuestion: (fromIndex, toIndex) =>
      set((state) => {
        if (state.quizData) {
          const questions = state.quizData.questions;
          const [movedQuestion] = questions.splice(fromIndex, 1);
          questions.splice(toIndex, 0, movedQuestion);
        }
      }),

    setEditing: (editing) =>
      set((state) => {
        state.isEditing = editing;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    reset: () =>
      set((state) => {
        state.quizData = null;
        state.isEditing = false;
        state.isLoading = false;
      }),
  })),
);
