"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import { Label } from "@/components/ui/label";
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
  Settings,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import TiptapEditor from "./tiptap-editor";

interface QuestionCardProps {
  question: QuestionData;
  onUpdate: (updatedQuestion: QuestionData) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddQuestion?: (afterIndex: number) => void;
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
  onAddQuestion,
  canMoveUp,
  canMoveDown,
  questionIndex,
}: QuestionCardProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
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

  const handleQuestionTypeChange = (newType: QuestionType) => {
    const updatedQuestion = { ...question, type: newType };
    if (newType === "FILL_BLANK" || newType === "FREE_RESPONSE") {
      updatedQuestion.answers = [];
      updatedQuestion.shortAnswerText = updatedQuestion.shortAnswerText || "";
    } else if (newType === "MULTIPLE_CHOICE" || newType === "TRUE_FALSE") {
      updatedQuestion.shortAnswerText = undefined;
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

  const handleExplanationChange = (html: string) => {
    onUpdate({ ...question, explanation: html });
  };

  const currentCorrectAnswerId =
    question.answers.find((ans) => ans.isCorrect)?.id || "";

  return (
    <div>
      <Card className="mb-6 border">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-700 text-md">
                Question {questionIndex + 1}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={question.type}
                onValueChange={handleQuestionTypeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                  <SelectItem value="FREE_RESPONSE">Free Response</SelectItem>
                </SelectContent>
              </Select>

              {(question.type === "MULTIPLE_CHOICE" ||
                question.type === "TRUE_FALSE") && (
                <Button
                  variant="outline"
                  onClick={handleAddAnswer}
                  className="whitespace-nowrap"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Answer
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="whitespace-nowrap"
              >
                <Settings className="mr-2 h-4 w-4" />
                Advanced
              </Button>

              {/* Actions */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(question.id)}
                className="ml-1"
                aria-label="Delete question"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
              <div
                className="flex cursor-grab items-center justify-center text-gray-400"
                title="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMoveUp(question.id)}
                  disabled={!canMoveUp}
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMoveDown(question.id)}
                  disabled={!canMoveDown}
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Editor full width */}
          <div className="mb-6 w-full">
            <TiptapEditor
              content={question.question}
              onChange={handleQuestionTextChange}
              placeholder="Enter your question here..."
              showToolbar={true}
            />
          </div>

          {/* Answers */}
          {question.type === "MULTIPLE_CHOICE" && (
            <div className="mb-2">
              <RadioGroup
                value={currentCorrectAnswerId}
                onValueChange={handleCorrectAnswerChange}
                className="grid gap-4"
              >
                {question.answers.map((answer, index) => {
                  const isCorrect = answer.isCorrect;
                  return (
                    <div
                      key={answer.id}
                      className={`flex items-start gap-2 rounded-md border p-3 transition-all duration-200 ${
                        isCorrect
                          ? "border-green-500 bg-green-100 shadow-sm dark:border-green-400 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <RadioGroupItem
                        value={answer.id}
                        id={`answer-${answer.id}`}
                        className="mt-4"
                      />
                      <div className="relative flex flex-1 items-center gap-2">
                        <div className="flex-1">
                          <TiptapEditor
                            content={answer.text}
                            onChange={(html) =>
                              handleAnswerTextChange(answer.id, html)
                            }
                            placeholder={`Answer ${index + 1}`}
                            showToolbar={true}
                            className={`w-full ${isCorrect ? "border-none bg-green-100 dark:bg-green-900/30" : ""}`}
                          />
                        </div>
                        {isCorrect && (
                          <div className="-right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-sm dark:bg-green-400 dark:text-gray-900">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnswer(answer.id)}
                        className="mt-2"
                        title="Delete answer"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {question.type === "TRUE_FALSE" && (
            <RadioGroup
              value={currentCorrectAnswerId}
              onValueChange={handleCorrectAnswerChange}
              className="grid gap-3"
            >
              {question.answers.map((answer) => {
                const isCorrect = answer.isCorrect;
                return (
                  <div
                    key={answer.id}
                    className={`flex items-start gap-2 rounded-md border p-3 transition-all duration-200 ${
                      isCorrect
                        ? "border-green-500 bg-green-100 shadow-sm dark:border-green-400 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value={answer.id}
                      id={`answer-${answer.id}`}
                      className="mt-4"
                    />
                    <div className="relative flex flex-1 items-center gap-2">
                      <div className="flex-1">
                        <TiptapEditor
                          content={answer.text}
                          onChange={(html) =>
                            handleAnswerTextChange(answer.id, html)
                          }
                          placeholder={
                            answer.text === "True" ? "True" : "False"
                          }
                          showToolbar={true}
                          className={`w-full ${isCorrect ? "border-none bg-green-100 dark:bg-green-900/30" : ""}`}
                        />
                      </div>
                      {isCorrect && (
                        <div className="-right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-sm dark:bg-green-400 dark:text-gray-900">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="mt-2"
                      title="Delete answer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {(question.type === "FILL_BLANK" ||
            question.type === "FREE_RESPONSE") && (
            <div className="w-full">
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

          {/* Advanced Settings */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
              {/* Explanation */}
              <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      className="h-3.5 w-3.5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <Label
                    htmlFor="explanation"
                    className="bg-emerald-50/50 font-medium text-sm"
                  >
                    Explanation (Optional)
                  </Label>
                </div>
                <div className="rounded-md border-emerald-200 bg-white">
                  <TiptapEditor
                    content={question.explanation || ""}
                    onChange={handleExplanationChange}
                    placeholder="Explain why this answer is correct..."
                    showToolbar={true}
                    className="min-h-[100px] border-none bg-blue-50"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
      {onAddQuestion && (
        <div className="group relative my-4">
          <div className="absolute top-1/2 w-full border-gray-100 border-t dark:border-gray-700" />

          <div className="flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddQuestion(questionIndex)}
              className="relative z-10 bg-white px-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-900"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
