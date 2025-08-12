"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { useQuizEditorSync } from "@/hooks/use-quiz-editor-sync";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { QuizDescriptionEditor } from "./quiz-description-editor";
import { QuizEditorHeader } from "./quiz-editor-header";
import { QuizQuestionsEditor } from "./quiz-questions-editor";
import { QuizTagsCategoriesEditor } from "./quiz-tags-categories-editor";
import { QuizTitleEditor } from "./quiz-title-editor";
export function QuizEditorContent() {
  const {
    quizData,
    addQuestion,
    addQuestionAfter,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    updateQuizData,
  } = useQuizEditorStore();
  const { title, description, updateTitle, updateDescription } =
    useQuizEditorSync();

  if (!quizData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">
          No quiz data found. Please go back and upload files first.
        </div>
      </div>
    );
  }

  const handleUpdateQuestion = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion.id, updatedQuestion);
  };

  const handleMoveQuestionUp = (id: string) => {
    const index = quizData.questions.findIndex((q) => q.id === id);
    if (index > 0) {
      moveQuestion(index, index - 1);
    }
  };

  const handleMoveQuestionDown = (id: string) => {
    const index = quizData.questions.findIndex((q) => q.id === id);
    if (index < quizData.questions.length - 1) {
      moveQuestion(index, index + 1);
    }
  };

  const handleAddQuestionAfter = (afterIndex: number) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      question: "<p>New Question</p>",
      type: "MULTIPLE_CHOICE" as const,
      points: 1,
      answers: [
        {
          id: crypto.randomUUID(),
          text: "<p>New Answer</p>",
          isCorrect: false,
          order_index: 1,
        },
      ],
    };

    addQuestionAfter(afterIndex, newQuestion);
  };

  const handleCategoryChange = (category: string) => {
    if (quizData) {
      const currentMetadata = quizData.metadata || {
        total_questions: quizData.questions.length,
        total_points: quizData.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(quizData.questions.length * 1.5), // 1.5 minutes per question
        tags: [],
      };

      updateQuizData({
        metadata: {
          ...currentMetadata,
          category,
        },
      });
    }
  };

  const handleTagsChange = (tags: string[]) => {
    if (quizData) {
      const currentMetadata = quizData.metadata || {
        total_questions: quizData.questions.length,
        total_points: quizData.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(quizData.questions.length * 1.5), // 1.5 minutes per question
        tags: [],
      };

      updateQuizData({
        metadata: {
          ...currentMetadata,
          tags,
        },
      });
    }
  };

  return (
    <ThinLayout>
      <div className="space-y-1">
        <QuizEditorHeader
          onSave={() => {}}
          onCreateQuiz={() => {}}
          canSave={false}
          canCreate={false}
        />
        {/* Quiz Title */}
        <QuizTitleEditor title={title} onTitleChange={updateTitle} />

        {/* Quiz Description */}
        <QuizDescriptionEditor
          description={description}
          onDescriptionChange={updateDescription}
        />

        {/* Quiz Tags & Categories */}
        <QuizTagsCategoriesEditor
          category={quizData.metadata?.category || ""}
          onCategoryChange={handleCategoryChange}
          tags={quizData.metadata?.tags || []}
          onTagsChange={handleTagsChange}
        />

        {/* Questions */}
        <QuizQuestionsEditor
          questions={quizData.questions}
          onAddQuestion={addQuestion}
          onAddQuestionAfter={handleAddQuestionAfter}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={deleteQuestion}
          onMoveQuestionUp={handleMoveQuestionUp}
          onMoveQuestionDown={handleMoveQuestionDown}
        />
      </div>
    </ThinLayout>
  );
}
