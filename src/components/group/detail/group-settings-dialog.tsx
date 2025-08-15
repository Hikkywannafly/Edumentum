"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { groupAPI } from "../../../lib/api/group";
import { updateStudyGroupSchema } from "../../../lib/schemas/group";
import type { UpdateStudyGroupFormData } from "../../../lib/schemas/group";

interface GroupSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  group: UpdateStudyGroupFormData;
  onGroupUpdate?: (updated: UpdateStudyGroupFormData) => void;
}

export default function GroupSettingsDialog({
  open,
  onClose,
  group,
  onGroupUpdate,
}: GroupSettingsDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStudyGroupFormData>({
    resolver: zodResolver(updateStudyGroupSchema),
    defaultValues: group,
  });

  // Reset form khi `group` thay đổi hoặc khi mở dialog
  useEffect(() => {
    if (open) {
      reset(group);
    }
  }, [group, open, reset]);

  const onSubmit = async (data: UpdateStudyGroupFormData) => {
    try {
      const updated = await groupAPI.updateGroup(data, String(data.id));
      if (!updated) throw new Error("API returned invalid group data");
      onGroupUpdate?.(updated);
      toast.success("Cập nhật nhóm thành công.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Cập nhật thất bại: ${err.message}`
          : "Cập nhật thất bại",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin nhóm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input type="hidden" {...register("id")} />
          <label className="flex flex-col">
            Tên nhóm
            <input
              type="text"
              {...register("name")}
              className={`mt-1 rounded-md border p-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <span className="text-red-500">{errors.name.message}</span>
            )}
          </label>
          <label className="flex flex-col">
            Mô tả nhóm
            <textarea
              rows={3}
              {...register("description")}
              className={`mt-1 rounded-md border p-2 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <span className="text-red-500">{errors.description.message}</span>
            )}
          </label>
          <label className="flex flex-col">
            Số lượng thành viên
            <input
              type="number"
              {...register("memberLimit", { valueAsNumber: true })}
              className={`mt-1 rounded-md border p-2 ${
                errors.memberLimit ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.memberLimit && (
              <span className="text-red-500">{errors.memberLimit.message}</span>
            )}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("public")}
              className="rounded border-gray-300"
            />
            Công khai nhóm
          </label>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button onClick={() => onClose()} type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
