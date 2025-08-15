"use client";

import { Button } from "@/components/ui/button";
import { Folder, Upload } from "lucide-react";

interface HeaderProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export function GroupStoreHeader({
  onCreateFolder,
  onUploadFile,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
          Quản lý bài học
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tải lên và quản lý tài liệu, bài giảng trong nhóm
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCreateFolder}>
          <Folder className="mr-2 h-4 w-4" />
          Tạo thư mục
        </Button>
        <Button onClick={onUploadFile}>
          <Upload className="mr-2 h-4 w-4" />
          Tải lên
        </Button>
      </div>
    </div>
  );
}
