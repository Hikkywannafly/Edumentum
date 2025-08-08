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
import { useState } from "react";
import type { Task } from ".";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"toDo" | "inProgress" | "done">("toDo");
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [dueTime, setDueTime] = useState("8 AM");
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { title?: string; dueDate?: string; dueTime?: string } =
      {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!dueTime.trim()) {
      newErrors.dueTime = "Due time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const [hourStr, period] = dueTime.split(" ");
    const hour = Number.parseInt(hourStr, 10);
    let adjustedHour: number;
    if (period === "AM") {
      adjustedHour = hour === 12 ? 0 : hour;
    } else {
      adjustedHour = hour === 12 ? 12 : hour + 12;
    }
    const combinedDateTime = new Date(dueDate ?? new Date());
    if (adjustedHour != null) {
      combinedDateTime.setHours(adjustedHour, 0, 0, 0);
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      status: status,
      dueDate: combinedDateTime,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setStatus("toDo");
    setDueDate(new Date());
    setDueTime("8 AM");
    setErrors({});
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setDueDate(new Date(value));
    } else {
      setDueDate(null);
    }
    if (errors.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: undefined }));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDueTime(e.target.value);
    if (errors.dueTime) {
      setErrors((prev) => ({ ...prev, dueTime: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Enter the task details below.</DialogDescription>
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
            <Label>Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "toDo" ? "default" : "outline"}
                onClick={() => setStatus("toDo")}
                className="flex-1"
              >
                To Do
              </Button>
              <Button
                type="button"
                variant={status === "inProgress" ? "default" : "outline"}
                onClick={() => setStatus("inProgress")}
                className="flex-1"
              >
                In Progress
              </Button>
              <Button
                type="button"
                variant={status === "done" ? "default" : "outline"}
                onClick={() => setStatus("done")}
                className="flex-1"
              >
                Done
              </Button>
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
              <div className="flex gap-2">
                <select
                  id="dueHour"
                  value={dueTime}
                  onChange={handleTimeChange}
                  className={`w-full rounded-lg border-2 p-2 ${errors.dueTime ? "border-red-500" : "border-gray-300"}`}
                >
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
