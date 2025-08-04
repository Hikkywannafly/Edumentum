"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestionData } from "@/types/quiz";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import QuestionCard from "./question-card";
import TiptapEditor from "./tiptap-editor";

export default function QuizEditorPage() {
  const [quizTitle, setQuizTitle] = useState(
    "<p>Kiểm tra Lịch sử Việt Nam Cơ bản</p>",
  );
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: uuidv4(),
      question:
        "<p>Theo Hiệp định Giơnevơ năm 1954 về Đông Dương, nội dung nào sau đây phản ánh đúng tình hình của Việt Nam sau khi hiệp định được ký kết?</p>",
      type: "MULTIPLE_CHOICE",
      points: 10,
      answers: [
        {
          id: uuidv4(),
          text: "<p>Đất nước đã được thống nhất ngay lập tức.</p>",
          isCorrect: false,
          order_index: 1,
        },
        {
          id: uuidv4(),
          text: "<p>Miền Bắc đã được giải phóng hoàn toàn nhưng miền Nam thì chưa.</p>",
          isCorrect: false,
          order_index: 2,
        },
        {
          id: uuidv4(),
          text: "<p>Đất nước tạm thời bị chia cắt thành hai miền Nam, Bắc.</p>",
          isCorrect: true,
          order_index: 3,
        },
        {
          id: uuidv4(),
          text: "<p>Cả nước được giải phóng và tiến lên xây dựng chủ nghĩa xã hội ngay lập tức.</p>",
          isCorrect: false,
          order_index: 4,
        },
      ],
    },
  ]);

  const handleAddQuestion = () => {
    const newQuestion: QuestionData = {
      id: uuidv4(),
      question: "<p>New Question</p>",
      type: "MULTIPLE_CHOICE",
      points: 10,
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

  const handleSaveChanges = () => {
    console.log("Quiz Title:", quizTitle);
    console.log("Questions:", questions);
    alert("Quiz saved! Check console for data.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl">Edit quiz</h1>

        <div className="mb-8 flex items-center justify-between">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz
          </Button>
          <div className="flex gap-2">
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Quiz
            </Button>
            <Button onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
            <Button onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 font-medium text-lg">Quiz title</div>
            <TiptapEditor
              content={quizTitle}
              onChange={setQuizTitle}
              placeholder="Enter quiz title"
              showToolbar={true}
            />
          </CardContent>
        </Card>

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
    </div>
  );
}
