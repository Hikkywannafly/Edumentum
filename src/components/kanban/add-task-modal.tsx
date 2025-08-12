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
import { useState } from "react";
import type { ITask } from "../../types/task";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<ITask, "id">) => void;
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

export function AddTaskModal({
  isOpen,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ITask["status"]>("TODO");
  const [dueDate, setDueDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [dueTime, setDueTime] = useState("8 AM");
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
  }>({});

  const timeOptions = generateTimeOptions();

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      dueDate?: string;
      dueTime?: string;
    } = {};

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

    try {
      const hour = parseTimeToHour(dueTime);
      const [year, month, day] = dueDate.split("-").map(Number);
      const combinedDateTime = new Date(year, month - 1, day, hour, 0, 0, 0);

      onAddTask({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: combinedDateTime,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setDueDate(new Date().toISOString().split("T")[0]);
      setDueTime("8 AM");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
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

  const handleClose = () => {
    // Reset form when closing
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setDueDate(new Date().toISOString().split("T")[0]);
    setDueTime("8 AM");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                variant={status === "TODO" ? "default" : "outline"}
                onClick={() => setStatus("TODO")}
                className="flex-1"
              >
                To Do
              </Button>
              <Button
                type="button"
                variant={status === "IN_PROGRESS" ? "default" : "outline"}
                onClick={() => setStatus("IN_PROGRESS")}
                className="flex-1"
              >
                In Progress
              </Button>
              <Button
                type="button"
                variant={status === "DONE" ? "default" : "outline"}
                onClick={() => setStatus("DONE")}
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
