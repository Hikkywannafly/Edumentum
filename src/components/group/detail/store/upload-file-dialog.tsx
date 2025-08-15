"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import type { FolderType } from "./types";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderType[];
}

export function UploadFileDialog({
  open,
  onOpenChange,
  folders,
}: UploadFileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
          <DialogDescription>
            Chọn file để tải lên vào nhóm học tập
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Chọn file</Label>
            <div className="mt-2 flex justify-center rounded-lg border border-gray-900/25 border-dashed px-6 py-10">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-300" />
                <div className="mt-4 flex text-gray-600 text-sm leading-6">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Tải lên file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">hoặc kéo thả</p>
                </div>
                <p className="text-gray-600 text-xs leading-5">
                  PNG, JPG, PDF, DOCX tối đa 10MB
                </p>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="folder-select">Thư mục</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thư mục..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Thư mục gốc</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="file-description">Mô tả</Label>
            <Textarea
              id="file-description"
              placeholder="Mô tả ngắn về tài liệu..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onOpenChange(false)}>Tải lên</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
