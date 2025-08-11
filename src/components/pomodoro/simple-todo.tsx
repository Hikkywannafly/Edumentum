"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Task } from "./index";

interface SimpleTodoViewProps {
  tasks: Task[];
  newTask: string;
  selectedCategory: string;
  setNewTask: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  addTask: () => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
}

export function SimpleTodoView({
  tasks,
  newTask,
  setNewTask,
  addTask,
  toggleTaskCompletion,
  deleteTask,
}: SimpleTodoViewProps) {
  const t = useTranslations("Pomodoro");

  return (
    <div className="space-y-6">
      {/* Add Task */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("simpleTodo.placeholder")}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <Button onClick={addTask} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-2 font-semibold text-xl">{t("notTask")}</p>
              <p>{t("advice")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-lg border p-3"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`flex-1 ${task.completed ? "line-through" : ""}`}
                  >
                    {task.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
