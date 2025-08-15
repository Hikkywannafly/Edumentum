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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo thư mục mới</DialogTitle>
          <DialogDescription>
            Tạo thư mục để tổ chức tài liệu theo chủ đề
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder-name">Tên thư mục</Label>
            <Input id="folder-name" placeholder="Nhập tên thư mục..." />
          </div>
          <div>
            <Label htmlFor="folder-description">Mô tả</Label>
            <Textarea
              id="folder-description"
              placeholder="Mô tả ngắn về thư mục..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onOpenChange(false)}>Tạo thư mục</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
