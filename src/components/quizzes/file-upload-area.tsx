"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FILE_UPLOAD_LIMITS,
  getAcceptedFileTypes,
} from "@/lib/utils/file-utils";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";

interface FileUploadAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
  isDragActive: boolean;
}

export function FileUploadArea({ onDrop, isDragActive }: FileUploadAreaProps) {
  const t = useTranslations("Quizzes");
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles: FILE_UPLOAD_LIMITS.maxFiles,
    maxSize: FILE_UPLOAD_LIMITS.maxSize,
  });

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("create.fileWithAnswers.title")}
        </CardTitle>
        <CardDescription>
          {t("create.fileWithAnswers.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 font-medium text-lg">
            {isDragActive
              ? t("create.fileWithAnswers.dropHere")
              : t("create.fileWithAnswers.dropOrSelect")}
          </p>
          <p className="mb-4 text-muted-foreground text-sm">
            {t("create.fileWithAnswers.supportedFormats")}
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <Badge variant="outline">PDF</Badge>
            <Badge variant="outline">DOC(X)</Badge>
            <Badge variant="outline">PPT(X)</Badge>
            <Badge variant="outline">XLS(X)</Badge>
            <Badge variant="outline">JSON</Badge>
            <Badge variant="outline">MD</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {t("create.fileWithAnswers.limits")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
