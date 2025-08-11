"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain, Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingScreenProps {
  fileName: string;
  progress?: number; // 0-100, if undefined show indeterminate
  label?: string;
  isDone?: boolean;
}

export function ProcessingScreen({
  fileName,
  progress,
  label,
  isDone,
}: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: BookOpen,
      title: "Analyzing your study materials...",
      description: "Reading and understanding the content structure",
    },
    {
      icon: Brain,
      title: "Extracting questions and answers...",
      description: "Identifying question patterns and correct answers",
    },
    {
      icon: Zap,
      title: "Finalizing your quiz...",
      description: "Preparing everything for editing",
    },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  const currentStepData = steps[Math.min(currentStep, steps.length - 1)];
  const IconComponent = currentStepData.icon;

  const showIndeterminate = progress === undefined;
  const pct = Math.max(0, Math.min(100, progress ?? 0));

  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <Card className="relative w-full max-w-md shadow-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h2 className="mb-2 font-semibold text-xl">Preparing your quiz</h2>
            <p className="text-muted-foreground text-sm">
              {label || "Optimizing for speed and accuracy"}
            </p>
          </div>

          <div className="mb-6">
            <div className="mb-4 flex items-center justify-center gap-3">
              <IconComponent className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">{currentStepData.title}</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-6">
            {showIndeterminate ? (
              <div className="relative h-2 w-full overflow-hidden rounded bg-muted">
                <div className="h-full w-1/3 animate-pulse rounded bg-blue-500/70" />
              </div>
            ) : (
              <>
                <Progress value={pct} className="mb-2" />
                <p className="text-muted-foreground text-xs">{pct}% complete</p>
              </>
            )}
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>File: {fileName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>LLM calls are optimized for latency</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Parsing and validation in progress</span>
            </div>
          </div>

          {isDone && (
            <div className="mt-4 rounded-md bg-green-50 p-3">
              <p className="font-medium text-green-800 text-sm">
                ✅ Processing complete! Your quiz is ready.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
