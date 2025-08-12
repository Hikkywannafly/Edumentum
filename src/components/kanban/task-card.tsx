"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ITask } from "../../types/task";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface TaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging = false,
}: TaskCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const parseDate = (dateInput: Date | string): Date => {
    if (dateInput instanceof Date) {
      return dateInput;
    }
    // Parse date directly without timezone manipulation
    return new Date(dateInput);
  };

  const formatDueDateTime = (dateInput: Date | string): string => {
    const date = parseDate(dateInput);
    if (Number.isNaN(date.getTime())) {
      return "Invalid Date";
    }
    // Use local time formatting (Vietnam timezone)
    const formatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh", // Explicit Vietnam timezone
    });
    return formatter.format(date);
  };

  const isOverdue = (dateInput: Date | string): boolean => {
    const date = parseDate(dateInput);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return date < now;
  };

  const isDueToday = (dateInput: Date | string): boolean => {
    const date = parseDate(dateInput);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    // Compare dates in local timezone
    const dateInLocal = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    );
    const todayInLocal = new Date(
      today.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    );
    return (
      dateInLocal.getDate() === todayInLocal.getDate() &&
      dateInLocal.getMonth() === todayInLocal.getMonth() &&
      dateInLocal.getFullYear() === todayInLocal.getFullYear()
    );
  };

  const isDueSoon = (dateInput: Date | string): boolean => {
    const date = parseDate(dateInput);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff <= 2;
  };

  const getDueDateStyle = (dateInput: Date | string): string => {
    if (isOverdue(dateInput)) {
      return "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400";
    }
    if (isDueSoon(dateInput)) {
      return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
    }
    if (isDueToday(dateInput)) {
      return "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400";
    }
    return "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  };

  const getDueDateLabel = (dateInput: Date | string): string => {
    if (isOverdue(dateInput)) {
      return "Overdue";
    }
    if (isDueSoon(dateInput)) {
      return "Due soon";
    }
    if (isDueToday(dateInput)) {
      return "Due today";
    }
    return "";
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteModalOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`rounded-lg border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
        isDragging ? "shadow-lg" : "hover:shadow-md"
      } transition-all duration-200`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="mr-2 flex-1 select-none font-medium text-sm leading-tight">
          {task.title}
        </h3>
        <div
          className={`flex flex-shrink-0 gap-1 ${isDragging ? "pointer-events-none opacity-50" : ""}`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleEditClick}
            title="Edit task"
            disabled={isDragging}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Delete task"
                onClick={handleDeleteClick}
                disabled={isDragging}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{task.title}"? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {task.description && (
        <p className="mb-3 select-none text-gray-500 text-sm leading-relaxed dark:text-gray-400">
          {task.description}
        </p>
      )}
      {/* Due Date & Time Display */}
      {task.dueDate && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-xs ${getDueDateStyle(task.dueDate)}`}
          >
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="select-none truncate">
              {formatDueDateTime(task.dueDate)}
            </span>
          </div>
          {getDueDateLabel(task.dueDate) && (
            <span
              className={`flex-shrink-0 select-none font-medium text-xs ${
                isOverdue(task.dueDate)
                  ? "text-red-500 dark:text-red-400"
                  : isDueSoon(task.dueDate)
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {getDueDateLabel(task.dueDate)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
