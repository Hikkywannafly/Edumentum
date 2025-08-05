"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AIGeneratedUploader } from "./ai-generated-uploader";
import { FileWithAnswersUploader } from "./file-with-answers-uploader";

export function FlashcardCreator() {
  const t = useTranslations("Flashcards");
  const [activeTab, setActiveTab] = useState("manual");
  const [settings, setSettings] = useState({
    visibility: "private",
    language: "auto",
    cardType: "mixed",
    numberOfCards: "10-20",
    difficulty: "easy",
    parsingMode: "fast",
  });

  return (
    <ThinLayout maxWidth="6xl" classNames="py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl tracking-tight">
          {t("create.generateFlashcards")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("create.subtitle")}</p>
      </div>

      <div
        className={`grid gap-6 ${activeTab === "manual" ? "mx-auto max-w-4xl" : "lg:grid-cols-3"}`}
      >
        <div className={activeTab === "manual" ? "w-full" : "lg:col-span-2"}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full border-none"
          >
            <TabsList className="grid w-full grid-cols-2 border-none ">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("create.tabs.manual")}
              </TabsTrigger>
              <TabsTrigger
                value="ai-generated"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {t("create.tabs.aiGenerated")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-6 border-none">
              <FileWithAnswersUploader />
            </TabsContent>

            <TabsContent value="ai-generated" className="mt-6">
              <AIGeneratedUploader />
            </TabsContent>
          </Tabs>
        </div>

        {/* Settings - Only show for AI-generated tab */}
        {activeTab === "ai-generated" && (
          <div className="space-y-6">
            <Card className="border-none ">
              <CardHeader>
                <CardTitle className="border-none text-lg">
                  {t("create.settings.title")}
                </CardTitle>
                <CardDescription>
                  {t("create.settings.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.visibility")}
                  </Label>
                  <Select
                    value={settings.visibility}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, visibility: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("create.settings.private")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        {t("create.settings.private")}
                      </SelectItem>
                      <SelectItem value="public">
                        {t("create.settings.public")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.language")}
                  </Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("create.settings.autoDetect")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        {t("create.settings.autoDetect")}
                      </SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.cardType")}
                  </Label>
                  <Select
                    value={settings.cardType}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, cardType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("create.settings.mixed")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">
                        {t("create.settings.mixed")}
                      </SelectItem>
                      <SelectItem value="question-answer">
                        {t("create.settings.questionAnswer")}
                      </SelectItem>
                      <SelectItem value="cloze">
                        {t("create.settings.cloze")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.numberOfCards")}
                  </Label>
                  <Select
                    value={settings.numberOfCards}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        numberOfCards: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="10-20" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10</SelectItem>
                      <SelectItem value="10-20">10-20</SelectItem>
                      <SelectItem value="20-30">20-30</SelectItem>
                      <SelectItem value="30-50">30-50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.difficulty")}
                  </Label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("create.settings.easy")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        {t("create.settings.easy")}
                      </SelectItem>
                      <SelectItem value="medium">
                        {t("create.settings.medium")}
                      </SelectItem>
                      <SelectItem value="hard">
                        {t("create.settings.hard")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">
                    {t("create.settings.parsingMode")}
                  </Label>
                  <Select
                    value={settings.parsingMode}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, parsingMode: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("create.settings.fast")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">
                        {t("create.settings.fast")}
                      </SelectItem>
                      <SelectItem value="balanced">
                        {t("create.settings.balanced")}
                      </SelectItem>
                      <SelectItem value="thorough">
                        {t("create.settings.thorough")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                  <p>{t("create.settings.fastModeWarning")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card className="border-none">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("create.supportedFormats.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="secondary">DOC(X)</Badge>
                    <Badge variant="secondary">PPT(X)</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">XLS(X)</Badge>
                    <Badge variant="secondary">TXT</Badge>
                    <Badge variant="secondary">MD</Badge>
                  </div>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {t("create.supportedFormats.limit")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ThinLayout>
  );
}
