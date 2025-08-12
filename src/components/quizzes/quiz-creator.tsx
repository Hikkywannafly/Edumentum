"use client";

import ThinLayout from "@/components/layout/thin-layout";
import {} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AIGeneratedUploader } from "./ai-generated-uploader";
import { FileWithAnswersUploader } from "./file-with-answers-uploader";
import { ProcessingScreen } from "./processing-screen";
import { TextContentUploader } from "./text-content-uploader";

export function QuizCreator() {
  const t = useTranslations("Quizzes");
  const [activeTab, setActiveTab] = useState("file-with-answers");

  // Centralized processing overlay state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string | undefined>();
  const [processingFileName, setProcessingFileName] = useState<string>("");

  const handleProcessingStart = (fileName: string, label?: string) => {
    setProcessingFileName(fileName);
    setProcessingLabel(label);
    setProcessingDone(false);
    setIsProcessing(true);
  };

  const handleProcessingDone = (done: boolean) => {
    setProcessingDone(done);
    if (done) {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingDone(false);
        setProcessingLabel(undefined);
        setProcessingFileName("");
      }, 1500);
    } else {
      // Hide immediately on error
      setIsProcessing(false);
      setProcessingDone(false);
      setProcessingLabel(undefined);
      setProcessingFileName("");
    }
  };

  return (
    <ThinLayout maxWidth="6xl" classNames="py-6">
      <div className={`mb-8 text-center ${isProcessing ? "invisible" : ""}`}>
        <h1 className="font-bold text-3xl tracking-tight">
          {t("create.generateQuiz")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("create.subtitle")}</p>
      </div>

      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <ProcessingScreen
              fileName={processingFileName || "File"}
              label={processingLabel}
              isDone={processingDone}
            />
          </div>
        )}

        <div
          className={`grid gap-6 lg:grid-cols-3 ${
            isProcessing ? "invisible overflow-hidden" : ""
          }`}
          aria-busy={isProcessing}
        >
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full border-none"
            >
              <TabsList className="grid w-full grid-cols-3 border-none ">
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

                <TabsTrigger
                  value="text-content"
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Text Content
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="file-with-answers"
                className="mt-6 border-none"
              >
                <FileWithAnswersUploader
                  onProcessingStart={handleProcessingStart}
                  onProcessingDone={handleProcessingDone}
                />
              </TabsContent>

              <TabsContent value="ai-generated" className="mt-6">
                <AIGeneratedUploader
                  onProcessingStart={handleProcessingStart}
                  onProcessingDone={handleProcessingDone}
                />
              </TabsContent>

              <TabsContent value="text-content" className="mt-6 border-none">
                <TextContentUploader
                  onProcessingStart={handleProcessingStart}
                  onProcessingDone={handleProcessingDone}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ThinLayout>
  );
}
