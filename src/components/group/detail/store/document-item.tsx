import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { Document, ViewMode } from "./types";
import { getFileIcon } from "./utils";

interface DocumentItemProps {
  document: Document;
  viewMode: ViewMode;
}

export function DocumentItem({ document, viewMode }: DocumentItemProps) {
  return (
    <div
      className={`group rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        viewMode === "list" ? "flex items-center gap-4" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {getFileIcon(document.type)}
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium">{document.name}</h4>
          <p className="text-gray-500 text-sm dark:text-gray-400">
            {document.size} • {document.uploadedBy}
          </p>
          <p className="text-gray-400 text-xs">{document.uploadedAt}</p>
        </div>
      </div>
      <div className={`flex gap-2 ${viewMode === "grid" ? "mt-3" : ""}`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
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
    </div>
  );
}
