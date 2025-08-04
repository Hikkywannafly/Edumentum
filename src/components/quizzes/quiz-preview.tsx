"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GeneratedQuiz } from "@/hooks/use-file-processor";

interface QuizPreviewProps {
  quiz: GeneratedQuiz;
  onUpdateQuiz: (updates: Partial<GeneratedQuiz>) => void;
}

export function QuizPreview({ quiz, onUpdateQuiz }: QuizPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Quiz Preview</CardTitle>
        <CardDescription>
          {quiz.questions.length} questions extracted from files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quiz-title" className="font-medium text-sm">
                Title
              </label>
              <input
                id="quiz-title"
                type="text"
                value={quiz.title}
                onChange={(e) => onUpdateQuiz({ title: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
            <div>
              <label htmlFor="quiz-description" className="font-medium text-sm">
                Description
              </label>
              <input
                id="quiz-description"
                type="text"
                value={quiz.description}
                onChange={(e) => onUpdateQuiz({ description: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="rounded border p-3">
                <p className="font-medium">
                  Q{index + 1}: {question.question}
                </p>
                <div className="mt-2 space-y-1">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        readOnly
                        className="h-4 w-4"
                      />
                      <span
                        className={
                          answer.isCorrect ? "font-medium text-green-600" : ""
                        }
                      >
                        {answer.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
