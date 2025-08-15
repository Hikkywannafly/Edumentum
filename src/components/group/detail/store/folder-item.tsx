"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, FolderOpen, MoreHorizontal, Trash2 } from "lucide-react";
import type { FolderType, ViewMode } from "./types";

interface FolderItemProps {
  folder: FolderType;
  viewMode: ViewMode;
  onClick: () => void;
}

export function FolderItem({ folder, viewMode, onClick }: FolderItemProps) {
  return (
    <div
      className={`group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        viewMode === "list" ? "flex items-center gap-4" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <FolderOpen className="h-8 w-8 text-blue-500" />
        <div className="flex-1">
          <h4 className="font-medium">{folder.name}</h4>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {folder.documentCount} tài liệu
            {viewMode === "list" && ` • Tạo bởi ${folder.createdBy}`}
          </p>
          {folder.description && (
            <p className="mt-1 text-gray-400 text-xs">{folder.description}</p>
          )}
        </div>
      </div>
      {viewMode === "list" && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{folder.createdAt}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
