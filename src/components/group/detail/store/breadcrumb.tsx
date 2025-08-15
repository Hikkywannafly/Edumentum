"use client";

import { Button } from "@/components/ui/button";
import type { FolderType } from "./types";

interface BreadcrumbProps {
  selectedFolder: string | null;
  folders: FolderType[];
  onNavigateBack: () => void;
}

export function Breadcrumb({
  selectedFolder,
  folders,
  onNavigateBack,
}: BreadcrumbProps) {
  if (!selectedFolder) return null;

  return (
    <div className="flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
      <Button
        variant="ghost"
        size="sm"
        onClick={onNavigateBack}
        className="h-auto p-0 font-normal"
      >
        Tất cả
      </Button>
      <span>/</span>
      <span className="font-medium">
        {folders.find((f) => f.id === selectedFolder)?.name}
      </span>
    </div>
  );
}
