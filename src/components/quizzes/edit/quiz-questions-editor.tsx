"use client";

import QuestionCard from "@/components/shared/editor/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuestionData } from "@/types/quiz";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from "uuid";

interface QuizQuestionsEditorProps {
  questions: QuestionData[];
  onAddQuestion: (question: QuestionData) => void;
  onAddQuestionAfter: (afterIndex: number) => void;
  onUpdateQuestion: (question: QuestionData) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveQuestionUp: (id: string) => void;
  onMoveQuestionDown: (id: string) => void;
}

export function QuizQuestionsEditor({
  questions,
  onAddQuestion,
  onAddQuestionAfter,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestionUp,
  onMoveQuestionDown,
}: QuizQuestionsEditorProps) {
  const t = useTranslations("Quizzes.edit");

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      id: uuidv4(),
      question: `<p>${t("newQuestion")}</p>`,
      type: "MULTIPLE_CHOICE",
      points: 1,
      explanation: "",
      answers: [
        {
          id: uuidv4(),
          text: `<p>${t("newAnswer")}</p>`,
          isCorrect: false,
          order_index: 1,
        },
      ],
    };
    onAddQuestion(newQuestion);
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {t("questions")} ({questions.length})
          </CardTitle>
          <Button onClick={handleAddQuestion} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("addQuestion")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              onMoveUp={onMoveQuestionUp}
              onMoveDown={onMoveQuestionDown}
              onAddQuestion={onAddQuestionAfter}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
              questionIndex={index}
            />
          ))}
        </div>

        {questions.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            {t("noQuestions")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
