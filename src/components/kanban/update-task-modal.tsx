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
import { useEffect, useState } from "react";
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

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  }, [task]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details and status.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label>Move To</Label>
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
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
