"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";
import type { ITask } from "../../types/task";

interface UpdateTaskModalProps {
  task: ITask;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<ITask>) => Promise<void>;
  onTaskUpdated?: (updatedTask: ITask) => void;
}

const formatTimeForSelect = (hour: number): string => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour} ${period}`;
};

const parseTimeToHour = (timeStr: string): number => {
  const [hourStr, period] = timeStr.split(" ");
  let hour = Number.parseInt(hourStr, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
};

const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    times.push(formatTimeForSelect(hour));
  }
  return times;
};

export function UpdateTaskModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onTaskUpdated,
}: UpdateTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<ITask["status"]>(task.status);
  const [dueDate, setDueDate] = useState<string>("");
  const [dueTime, setDueTime] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
  }>({});

  const timeOptions = generateTimeOptions();

  const extractTimeFromDate = useCallback((date: Date): string => {
    return formatTimeForSelect(date.getHours());
  }, []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    if (task.dueDate) {
      const date =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setDueDate(`${year}-${month}-${day}`);
      setDueTime(extractTimeFromDate(date));
    } else {
      setDueDate(new Date().toISOString().split("T")[0]);
      setDueTime("8 AM");
    }
    setErrors({});
  }, [task, extractTimeFromDate]);

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      dueDate?: string;
      dueTime?: string;
    } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (!dueTime.trim()) newErrors.dueTime = "Due time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const hour = parseTimeToHour(dueTime);
      // FIX: Tạo date trong local timezone để tránh lệch múi giờ
      // Parse date parts manually để tránh timezone issues
      const [year, month, day] = dueDate.split("-").map(Number);
      const combinedDateTime = new Date(year, month - 1, day, hour, 0, 0, 0);

      const updates = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: combinedDateTime,
      };

      await onUpdateTask(task.id, updates);
      // If callback provided, use it instead of full fetch
      if (onTaskUpdated) {
        onTaskUpdated({ ...task, ...updates });
      }
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      setErrors({ dueDate: "Invalid date or time format" });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDueDate(value);
    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDueTime(e.target.value);
    if (errors.dueTime) setErrors((prev) => ({ ...prev, dueTime: undefined }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const getStatusLabel = (status: ITask["status"]): string => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details and status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={handleTitleChange}
              className={`rounded-lg border-2 ${errors.title ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.title && (
              <span className="text-red-500 text-sm">{errors.title}</span>
            )}
          </div>
          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none rounded-lg border-2 border-gray-300"
            />
          </div>
          {/* Status Selection */}
          <div className="grid gap-2">
            <Label>Move To</Label>
            <div className="flex gap-2">
              {(["TODO", "IN_PROGRESS", "DONE"] as ITask["status"][]).map(
                (s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={status === s ? "default" : "outline"}
                    onClick={() => setStatus(s)}
                    className="flex-1"
                  >
                    {getStatusLabel(s)}
                  </Button>
                ),
              )}
            </div>
          </div>
          {/* Due Date and Time */}
          <div className="grid gap-2">
            <Label>Due Date & Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={handleDateChange}
                  className={`rounded-lg border-2 ${errors.dueDate ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.dueDate && (
                  <span className="text-red-500 text-sm">{errors.dueDate}</span>
                )}
              </div>
              <div>
                <select
                  id="dueTime"
                  value={dueTime}
                  onChange={handleTimeChange}
                  className={`w-full rounded-lg border-2 p-2 ${errors.dueTime ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="" disabled>
                    Select time
                  </option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.dueTime && (
                  <span className="text-red-500 text-sm">{errors.dueTime}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
