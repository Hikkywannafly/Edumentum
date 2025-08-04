"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  Difficulty,
  Language,
  ParsingMode,
  QuestionType,
  QuizMode,
  QuizSettings,
  Task,
  Visibility,
} from "@/types/quiz";
import { useTranslations } from "next-intl";

interface QuizSettingsFormProps {
  settings: QuizSettings;
  onSettingsChange: (settings: QuizSettings) => void;
  isReadOnly?: boolean;
}

export function QuizSettingsForm({
  settings,
  onSettingsChange,
  isReadOnly = false,
}: QuizSettingsFormProps) {
  const t = useTranslations("Quizzes");

  const updateSetting = <K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K],
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("create.settings.title")}</CardTitle>
        <CardDescription>{t("create.settings.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={settings.visibility}
              onValueChange={(value: Visibility) =>
                updateSetting("visibility", value)
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="UNLISTED">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value: Language) =>
                updateSetting("language", value)
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO">Auto detect</SelectItem>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="VI">Vietnamese</SelectItem>
                <SelectItem value="ZH">Chinese</SelectItem>
                <SelectItem value="JA">Japanese</SelectItem>
                <SelectItem value="KO">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select
              value={settings.question_type}
              onValueChange={(value: QuestionType | "MIXED") =>
                updateSetting("question_type", value)
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIXED">Mixed</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                <SelectItem value="FREE_RESPONSE">Free Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfQuestions">Number of Questions</Label>
            <Input
              type="number"
              value={settings.number_of_questions}
              onChange={(e) =>
                updateSetting(
                  "number_of_questions",
                  Number.parseInt(e.target.value) || 10,
                )
              }
              min={1}
              max={100}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Mode & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select
              value={settings.mode}
              onValueChange={(value: QuizMode) => updateSetting("mode", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="FLASHCARD">Flashcard</SelectItem>
                <SelectItem value="STUDY_GUIDE">Study Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: Difficulty) =>
                updateSetting("difficulty", value)
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task & Parsing Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Select
              value={settings.task}
              onValueChange={(value: Task) => updateSetting("task", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERATE_QUIZ">Generate Quiz</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="TEST">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parsingMode">Parsing Mode</Label>
            <Select
              value={settings.parsing_mode}
              onValueChange={(value: ParsingMode) =>
                updateSetting("parsing_mode", value)
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAST">Fast</SelectItem>
                <SelectItem value="BALANCED">Balanced</SelectItem>
                <SelectItem value="THOROUGH">Thorough</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quiz Behavior Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Quiz Behavior</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.shuffle_questions}
                onCheckedChange={(checked) =>
                  updateSetting("shuffle_questions", checked)
                }
                disabled={isReadOnly}
              />
              <Label>Shuffle Questions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.shuffle_answers}
                onCheckedChange={(checked) =>
                  updateSetting("shuffle_answers", checked)
                }
                disabled={isReadOnly}
              />
              <Label>Shuffle Answers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.show_explanations}
                onCheckedChange={(checked) =>
                  updateSetting("show_explanations", checked)
                }
                disabled={isReadOnly}
              />
              <Label>Show Explanations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.allow_retry}
                onCheckedChange={(checked) =>
                  updateSetting("allow_retry", checked)
                }
                disabled={isReadOnly}
              />
              <Label>Allow Retry</Label>
            </div>
          </div>
        </div>

        {/* Time & Score Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit per Question (seconds)</Label>
            <Input
              type="number"
              value={settings.time_limit_per_question || ""}
              onChange={(e) =>
                updateSetting(
                  "time_limit_per_question",
                  e.target.value ? Number.parseInt(e.target.value) : null,
                )
              }
              min={0}
              placeholder="No limit"
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              type="number"
              value={settings.passing_score}
              onChange={(e) =>
                updateSetting(
                  "passing_score",
                  Number.parseInt(e.target.value) || 70,
                )
              }
              min={0}
              max={100}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Warning for Fast Mode */}
        {settings.parsing_mode === "FAST" && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              {t("create.settings.fastModeWarning")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
