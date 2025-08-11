"use client";

import QuestionCard from "@/components/shared/editor/question-card";
import TiptapEditor from "@/components/shared/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QuestionData } from "@/types/quiz";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface QuizEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quizData: {
    title: string;
    description: string;
    questions: QuestionData[];
  }) => void;
  initialQuiz?: {
    title: string;
    description: string;
    questions: QuestionData[];
  };
}

export function QuizEditorDialog({
  isOpen,
  onClose,
  onSave,
  initialQuiz,
}: QuizEditorDialogProps) {
  const t = useTranslations("Quizzes");
  const [quizTitle, setQuizTitle] = useState(initialQuiz?.title || "");
  const [quizDescription, setQuizDescription] = useState(
    initialQuiz?.description || "",
  );
  const [questions, setQuestions] = useState<QuestionData[]>(
    initialQuiz?.questions || [],
  );

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      id: uuidv4(),
      question: "<p>New Question</p>",
      type: "MULTIPLE_CHOICE",
      points: 1,
      answers: [
        {
          id: uuidv4(),
          text: "<p>New Answer</p>",
          isCorrect: false,
          order_index: 1,
        },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionData) => {
    setQuestions(
      questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleMoveQuestionUp = (id: string) => {
    const index = questions.findIndex((q) => q.id === id);
    if (index > 0) {
      const newQuestions = [...questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index - 1];
      newQuestions[index - 1] = temp;
      setQuestions(newQuestions);
    }
  };

  const handleMoveQuestionDown = (id: string) => {
    const index = questions.findIndex((q) => q.id === id);
    if (index < questions.length - 1) {
      const newQuestions = [...questions];
      const temp = newQuestions[index];
      newQuestions[index] = newQuestions[index + 1];
      newQuestions[index + 1] = temp;
      setQuestions(newQuestions);
    }
  };

  const handleSave = () => {
    onSave({
      title: quizTitle,
      description: quizDescription,
      questions: questions,
    });
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    if (!isOpen) {
      setQuizTitle(initialQuiz?.title || "");
      setQuizDescription(initialQuiz?.description || "");
      setQuestions(initialQuiz?.questions || []);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("create.fileWithAnswers.editQuiz")}</DialogTitle>
          <DialogDescription>
            {t("create.fileWithAnswers.editQuizDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Title */}
          <div>
            <div className="mb-2 font-medium text-sm">Quiz Title</div>
            <TiptapEditor
              content={quizTitle}
              onChange={setQuizTitle}
              placeholder="Enter quiz title"
              showToolbar={true}
            />
          </div>

          {/* Quiz Description */}
          <div>
            <div className="mb-2 font-medium text-sm">Quiz Description</div>
            <TiptapEditor
              content={quizDescription}
              onChange={setQuizDescription}
              placeholder="Enter quiz description"
              showToolbar={true}
            />
          </div>

          {/* Questions */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-lg">
                Questions ({questions.length})
              </h3>
              <Button onClick={handleAddQuestion} size="sm">
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onMoveUp={handleMoveQuestionUp}
                  onMoveDown={handleMoveQuestionDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < questions.length - 1}
                  questionIndex={index}
                />
              ))}
            </div>

            {questions.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No questions yet. Click "Add Question" to get started.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={questions.length === 0}>
            Save Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
