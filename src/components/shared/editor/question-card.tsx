"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Answer, QuestionData, QuestionType } from "@/types/quiz";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import TiptapEditor from "./tiptap-editor";

interface QuestionCardProps {
  question: QuestionData;
  onUpdate: (updatedQuestion: QuestionData) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  questionIndex: number;
}

export default function QuestionCard({
  question,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  questionIndex,
}: QuestionCardProps) {
  const handleQuestionTextChange = (html: string) => {
    onUpdate({ ...question, question: html });
  };

  const handleAnswerTextChange = (answerId: string, html: string) => {
    const updatedAnswers = question.answers.map((ans) =>
      ans.id === answerId ? { ...ans, text: html } : ans,
    );
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const handleShortAnswerTextChange = (html: string) => {
    onUpdate({ ...question, shortAnswerText: html });
  };

  const handleAddAnswer = () => {
    const newAnswer: Answer = {
      id: uuidv4(),
      text: "",
      isCorrect: false,
      order_index: question.answers.length + 1,
    };
    onUpdate({ ...question, answers: [...question.answers, newAnswer] });
  };

  const handleDeleteAnswer = (answerId: string) => {
    const updatedAnswers = question.answers.filter(
      (ans) => ans.id !== answerId,
    );
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const handleCorrectAnswerChange = (value: string) => {
    const updatedAnswers = question.answers.map((ans) => ({
      ...ans,
      isCorrect: ans.id === value,
    }));
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const handleTrueFalseChange = (value: string) => {
    const updatedAnswers = question.answers.map((ans) => ({
      ...ans,
      isCorrect: ans.text === value,
    }));
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const handleQuestionTypeChange = (newType: QuestionType) => {
    const updatedQuestion = { ...question, type: newType };
    if (newType === "FILL_BLANK" || newType === "FREE_RESPONSE") {
      updatedQuestion.answers = []; // Clear answers for fill blank/free response
      updatedQuestion.shortAnswerText = updatedQuestion.shortAnswerText || "";
    } else if (newType === "MULTIPLE_CHOICE" || newType === "TRUE_FALSE") {
      updatedQuestion.shortAnswerText = undefined; // Clear short answer text
      if (newType === "TRUE_FALSE" && updatedQuestion.answers.length !== 2) {
        updatedQuestion.answers = [
          { id: uuidv4(), text: "True", isCorrect: false, order_index: 1 },
          { id: uuidv4(), text: "False", isCorrect: false, order_index: 2 },
        ];
      } else if (
        newType === "MULTIPLE_CHOICE" &&
        updatedQuestion.answers.length === 0
      ) {
        updatedQuestion.answers = [
          { id: uuidv4(), text: "", isCorrect: false, order_index: 1 },
        ];
      }
    }
    onUpdate(updatedQuestion);
  };

  const currentCorrectAnswerId =
    question.answers.find((ans) => ans.isCorrect)?.id || "";

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex cursor-grab items-center justify-center text-gray-400">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onMoveUp(question.id)}
                disabled={!canMoveUp}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onMoveDown(question.id)}
                disabled={!canMoveDown}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mb-8 flex-1">
            <div className="mb-2 font-medium text-gray-600 text-sm">
              Question {questionIndex + 1}
            </div>
            <TiptapEditor
              content={question.question}
              onChange={handleQuestionTextChange}
              placeholder="Enter your question here..."
              showToolbar={true}
            />
          </div>
        </div>

        {question.type === "MULTIPLE_CHOICE" && (
          <div className="mb-8">
            <RadioGroup
              value={currentCorrectAnswerId}
              onValueChange={handleCorrectAnswerChange}
              className="grid gap-4"
            >
              {question.answers.map((answer, index) => (
                <div key={answer.id} className="mb-4 flex items-start gap-2">
                  <RadioGroupItem
                    value={answer.id}
                    id={`answer-${answer.id}`}
                    className="mt-4"
                  />
                  <div className="flex-1">
                    <TiptapEditor
                      content={answer.text}
                      onChange={(html) =>
                        handleAnswerTextChange(answer.id, html)
                      }
                      placeholder={`Answer ${index + 1}`}
                      showToolbar={true}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAnswer(answer.id)}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete answer</span>
                  </Button>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {question.type === "TRUE_FALSE" && (
          <RadioGroup
            value={currentCorrectAnswerId}
            onValueChange={handleTrueFalseChange}
            className="grid gap-2"
          >
            {question.answers.map((answer, _index) => (
              <div key={answer.id} className="flex items-start gap-2">
                <RadioGroupItem
                  value={answer.text}
                  id={`answer-${answer.id}`}
                  className="mt-4"
                />
                <div className="flex-1">
                  <TiptapEditor
                    content={answer.text}
                    onChange={(html) => handleAnswerTextChange(answer.id, html)}
                    placeholder={answer.text === "True" ? "True" : "False"}
                    showToolbar={true}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteAnswer(answer.id)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Delete answer</span>
                </Button>
              </div>
            ))}
          </RadioGroup>
        )}

        {(question.type === "FILL_BLANK" ||
          question.type === "FREE_RESPONSE") && (
          <div>
            <TiptapEditor
              content={question.shortAnswerText || ""}
              onChange={handleShortAnswerTextChange}
              placeholder={
                question.type === "FILL_BLANK"
                  ? "Enter the correct answer..."
                  : "Enter the expected response..."
              }
              showToolbar={true}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Select
              value={question.type}
              onValueChange={handleQuestionTypeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                <SelectItem value="FREE_RESPONSE">Free Response</SelectItem>
              </SelectContent>
            </Select>
            {(question.type === "MULTIPLE_CHOICE" ||
              question.type === "TRUE_FALSE") && (
              <Button variant="outline" onClick={handleAddAnswer}>
                <Plus className="mr-2 h-4 w-4" /> Add Answer
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Delete question</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
