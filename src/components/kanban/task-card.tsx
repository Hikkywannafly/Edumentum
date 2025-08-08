import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Task } from ".";
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
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDueDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const isOverdue = (date: Date): boolean => {
    const now = new Date();
    return date < now;
  };

  const isDueToday = (date: Date): boolean => {
    const today = new Date();
    const dueDate = new Date(date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const isDueSoon = (date: Date): boolean => {
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff > 0 && hoursDiff <= 2; // Due within 2 hours
  };

  const getDueDateStyle = (date: Date): string => {
    if (isOverdue(date)) {
      return "text-red-500 bg-red-50";
    }
    if (isDueSoon(date)) {
      return "text-amber-600 bg-amber-50";
    }
    if (isDueToday(date)) {
      return "text-orange-600 bg-orange-50";
    }
    return "text-gray-600 bg-gray-50";
  };

  const getDueDateLabel = (date: Date): string => {
    if (isOverdue(date)) {
      return "Overdue";
    }
    if (isDueSoon(date)) {
      return "Due soon";
    }
    if (isDueToday(date)) {
      return "Due today";
    }
    return "";
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-medium text-sm">{task.title}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this action? This action
                  cannot be undone.{" "}
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
                  Delete forever
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {task.description && (
        <p className="mb-2 text-gray-500 text-sm dark:text-gray-400">
          {task.description}
        </p>
      )}

      {/* Due Date & Time Display */}
      {task.dueDate && (
        <div className="mt-2 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-xs ${getDueDateStyle(task.dueDate)}`}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatDueDateTime(task.dueDate)}</span>
          </div>
          {getDueDateLabel(task.dueDate) && (
            <span
              className={`font-medium text-xs ${
                isOverdue(task.dueDate)
                  ? "text-red-500"
                  : isDueSoon(task.dueDate)
                    ? "text-amber-600"
                    : "text-orange-600"
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
