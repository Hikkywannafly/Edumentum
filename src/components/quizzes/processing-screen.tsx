"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Brain, Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingScreenProps {
  fileName: string;
  onComplete?: () => void;
}

export function ProcessingScreen({
  fileName,
  onComplete,
}: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

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

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h2 className="mb-2 font-semibold text-xl">
              Processing in Fast Mode
            </h2>
            <p className="text-muted-foreground text-sm">
              This will be quick and accurate
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
            <Progress value={progress} className="mb-2" />
            <p className="text-muted-foreground text-xs">
              {progress}% complete
            </p>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>File: {fileName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Using advanced regex patterns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Optimized for speed and accuracy</span>
            </div>
          </div>

          {isComplete && (
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
