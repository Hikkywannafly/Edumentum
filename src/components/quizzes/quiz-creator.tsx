"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AIGeneratedUploader } from "./ai-generated-uploader";
import { FileWithAnswersUploader } from "./file-with-answers-uploader";

export function QuizCreator() {
  const t = useTranslations("Quizzes");
  const [activeTab, setActiveTab] = useState("file-with-answers");

  return (
    <ThinLayout maxWidth="6xl" classNames="py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl tracking-tight">
          {t("create.generateQuiz")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("create.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full border-none"
          >
            <TabsList className="grid w-full grid-cols-2 border-none ">
              <TabsTrigger
                value="ai-generated"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {t("create.tabs.aiGenerated")}
              </TabsTrigger>

              <TabsTrigger
                value="file-with-answers"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {t("create.tabs.fileWithAnswers")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file-with-answers" className="mt-6 border-none">
              <FileWithAnswersUploader />
            </TabsContent>

            <TabsContent value="ai-generated" className="mt-6">
              <AIGeneratedUploader />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
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
                  <Badge variant="secondary">JSON</Badge>
                  <Badge variant="secondary">MD</Badge>
                </div>
                <p className="mt-2 text-muted-foreground text-xs">
                  {t("create.supportedFormats.limit")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThinLayout>
  );
}
