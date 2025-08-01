"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { Task } from ".";
import { Button } from "../ui/button";
import { AddTaskModal } from "./add-task-modal";
import { TaskCard } from "./task-card";
import { UpdateTaskModal } from "./update-task-modal";

export default function KanbanContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    );
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const columns: { title: string; status: Task["status"]; color: string }[] = [
    {
      title: "To Do",
      status: "toDo",
      color: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "In Progress",
      status: "inProgress",
      color: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Done",
      status: "done",
      color: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="font-bold text-2xl">Kanban Board</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.status}
            className={`flex flex-col rounded-lg border ${column.color} p-4`}
          >
            <div className="mb-4 flex items-center justify-between border-b">
              <h3 className="mb-2 flex items-center gap-2 font-medium">
                <span
                  className={`h-2 w-2 rounded-full ${
                    column.status === "toDo"
                      ? "bg-yellow-500"
                      : column.status === "inProgress"
                        ? "bg-blue-500"
                        : "bg-green-500"
                  }`}
                />
                {column.title}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 font-medium text-xs dark:bg-gray-800">
                {tasks.filter((task) => task.status === column.status).length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              {tasks.filter((task) => task.status === column.status).length ===
                0 && (
                <div className="text-center text-gray-500 text-sm dark:text-gray-400">
                  No tasks yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />

      {selectedTask && (
        <UpdateTaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}
