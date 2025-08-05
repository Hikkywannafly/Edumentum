"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Brain,
  CheckCircle,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "ai-generating" | "success" | "error";
  progress: number;
  error?: string;
}

export function AIGeneratedUploader() {
  const t = useTranslations("Flashcards");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      status: "uploading",
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate file processing
    for (const file of newFiles) {
      simulateFileProcessing(file.id);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB for AI processing
  });

  const simulateFileProcessing = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            if (file.progress < 100) {
              return { ...file, progress: file.progress + 10 };
            }
            clearInterval(interval);
            return { ...file, status: "processing" };
          }
          return file;
        }),
      );
    }, 200);

    // Simulate processing completion and start AI generation
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            return { ...file, status: "ai-generating", progress: 0 };
          }
          return file;
        }),
      );

      // Simulate AI generation
      simulateAIGeneration(fileId);
    }, 3000);
  };

  const simulateAIGeneration = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            if (file.progress < 100) {
              return { ...file, progress: file.progress + 5 };
            }
            clearInterval(interval);
            return { ...file, status: "success" };
          }
          return file;
        }),
      );
    }, 300);

    // Simulate AI generation completion
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            return { ...file, status: "success" };
          }
          return file;
        }),
      );
    }, 8000);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "pptx":
      case "ppt":
        return <FileText className="h-8 w-8 text-orange-500" />;
      case "xlsx":
      case "xls":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "txt":
        return <FileText className="h-8 w-8 text-gray-500" />;
      case "md":
        return <FileText className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      case "processing":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
        );
      case "ai-generating":
        return <Brain className="h-4 w-4 animate-pulse text-purple-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return t("create.aiGenerated.uploading");
      case "processing":
        return t("create.aiGenerated.processing");
      case "ai-generating":
        return t("create.aiGenerated.aiGenerating");
      case "success":
        return t("create.aiGenerated.success");
      case "error":
        return t("create.aiGenerated.error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const startAIGeneration = () => {
    setIsGenerating(true);
    // Simulate AI generation for all files
    for (const file of uploadedFiles) {
      if (file.status === "success") {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "ai-generating", progress: 0 }
              : f,
          ),
        );
        simulateAIGeneration(file.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t("create.aiGenerated.title")}
          </CardTitle>
          <CardDescription>
            {t("create.aiGenerated.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Brain className="mx-auto mb-4 h-12 w-12 text-purple-400" />
            <p className="mb-2 font-medium text-lg">
              {isDragActive
                ? t("create.aiGenerated.dropHere")
                : t("create.aiGenerated.dropOrSelect")}
            </p>
            <p className="mb-4 text-muted-foreground text-sm">
              {t("create.aiGenerated.supportedFormats")}
            </p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              <Badge variant="outline">PDF</Badge>
              <Badge variant="outline">DOC(X)</Badge>
              <Badge variant="outline">PPT(X)</Badge>
              <Badge variant="outline">XLS(X)</Badge>
              <Badge variant="outline">TXT</Badge>
              <Badge variant="outline">MD</Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("create.aiGenerated.limits")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("create.aiGenerated.uploadedFiles")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  {getFileIcon(file.name)}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate font-medium">{file.name}</p>
                      {getStatusIcon(file.status)}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <span>{formatFileSize(file.size)}</span>
                      <span
                        className={
                          file.status === "ai-generating"
                            ? "text-purple-600"
                            : ""
                        }
                      >
                        {getStatusText(file.status)}
                      </span>
                      {file.status === "error" && (
                        <span className="text-red-600">{file.error}</span>
                      )}
                    </div>
                    {(file.status === "uploading" ||
                      file.status === "processing" ||
                      file.status === "ai-generating") && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Generation Controls */}
      {uploadedFiles.some((f) => f.status === "success") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {t("create.aiGenerated.aiControls")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {t("create.aiGenerated.aiDescription")}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={startAIGeneration}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("create.aiGenerated.startGeneration")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("create.aiGenerated.guidance")}
        </p>
        <Button
          disabled={
            uploadedFiles.length === 0 ||
            uploadedFiles.some(
              (f) =>
                f.status === "uploading" ||
                f.status === "processing" ||
                f.status === "ai-generating",
            )
          }
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {t("create.aiGenerated.createDeck")}
        </Button>
      </div>
    </div>
  );
}
