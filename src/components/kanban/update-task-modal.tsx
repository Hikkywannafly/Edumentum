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
import type { Task } from ".";

interface UpdateTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function UpdateTaskModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
}: UpdateTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate || null);
  const [dueTime, setDueTime] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
  }>({});

  const extractTimeFromDate = useCallback((date: Date | null): string => {
    if (!date) return "";
    let hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours} ${period}`;
  }, []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setDueDate(task.dueDate || null);
    setDueTime(extractTimeFromDate(task.dueDate || null));
    setErrors({});
  }, [task, extractTimeFromDate]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; dueDate?: string; dueTime?: string } =
      {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (!dueTime.trim()) newErrors.dueTime = "Due time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const [hourStr, period] = dueTime.split(" ");
    let hour = Number.parseInt(hourStr, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    if (!dueDate) return;
    const combinedDateTime = new Date(dueDate);
    combinedDateTime.setHours(hour, 0, 0, 0);

    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate: combinedDateTime,
    });

    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDueDate(value ? new Date(value) : null);
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

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
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
              {["toDo", "inProgress", "done"].map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? "default" : "outline"}
                  onClick={() => setStatus(s as Task["status"])}
                  className="flex-1"
                >
                  {s === "toDo"
                    ? "To Do"
                    : s === "inProgress"
                      ? "In Progress"
                      : "Done"}
                </Button>
              ))}
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
                  value={formatDateForInput(dueDate)}
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
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) =>
                    ["AM", "PM"].map((period) => {
                      const val = `${hour} ${period}`;
                      return (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      );
                    }),
                  )}
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
