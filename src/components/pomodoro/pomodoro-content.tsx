"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, Plus, RotateCcw, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Task, ViewMode } from ".";
import { KanbanBoardView } from "./kanban-board";
import { SimpleTodoView } from "./simple-todo";

type TimerMode = "focus" | "shortBreak" | "longBreak";
type TimerType = "pomodoro" | "countdown";

export default function PomodoroContent() {
  const [timerType, setTimerType] = useState<TimerType>("pomodoro");
  const [timerMode, setTimerMode] = useState<TimerMode>("focus");
  const [countdownMinutes, setCountdownMinutes] = useState(1);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Test",
      category: "Uncategorized",
      completed: false,
      status: "todo",
    },
    {
      id: "2",
      text: "Test02",
      category: "Uncategorized",
      completed: false,
      status: "todo",
    },
    {
      id: "3",
      text: "Test1",
      category: "Uncategorized",
      completed: false,
      status: "todo",
    },
  ]);
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Uncategorized");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("todo");

  const timerModes = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Khi đổi timerType, cập nhật lại thời gian phù hợp
  const handleTimerTypeChange = (type: TimerType) => {
    setTimerType(type);
    setIsRunning(false);
    if (type === "pomodoro") {
      setTimerMode("focus");
      setTime(timerModes.focus);
    } else if (type === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  // Khi đổi số phút countdown, cập nhật lại time nếu đang ở countdown
  const handleCountdownMinutesChange = (val: number) => {
    setCountdownMinutes(val);
    if (timerType === "countdown") {
      setTime(val * 60);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerType === "pomodoro") {
      setTime(timerModes[timerMode]);
    } else if (timerType === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setTime(timerModes[mode]);
    setIsRunning(false);
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        category: selectedCategory,
        completed: false,
        status: "todo",
      };
      setTasks([...tasks, task]);
      setNewTask("");
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Tính progress phù hợp cho từng chế độ
  let progress = 0;
  if (timerType === "pomodoro") {
    progress = ((timerModes[timerMode] - time) / timerModes[timerMode]) * 100;
  } else if (timerType === "countdown") {
    progress = ((countdownMinutes * 60 - time) / (countdownMinutes * 60)) * 100;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-2">
        {/* Timer Section */}
        <Card className="p-6">
          <CardContent className="space-y-6">
            {/* Timer Type Tags */}
            <div className="flex justify-center gap-2">
              {(["pomodoro", "countdown"] as TimerType[]).map((type) => (
                <Button
                  key={type}
                  variant={timerType === type ? "default" : "outline"}
                  onClick={() => handleTimerTypeChange(type)}
                  className="rounded-full px-6 py-2 font-medium capitalize"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {/* Countdown input nếu là countdown */}
            {timerType === "countdown" && (
              <div className="my-4 flex items-center justify-center gap-2">
                <label htmlFor="countdown-minutes" className="font-medium">
                  Duration (minutes):
                </label>
                <input
                  type="number"
                  min={1}
                  value={countdownMinutes}
                  onChange={(e) =>
                    handleCountdownMinutesChange(
                      Math.max(1, Number(e.target.value)),
                    )
                  }
                  className="w-20 rounded border px-3 py-1 text-center"
                />
              </div>
            )}

            {/* Timer Mode Buttons */}
            {timerType === "pomodoro" && (
              <div className="flex gap-2">
                <Button
                  variant={timerMode === "focus" ? "default" : "outline"}
                  onClick={() => handleModeChange("focus")}
                >
                  Focus
                </Button>
                <Button
                  variant={timerMode === "shortBreak" ? "default" : "outline"}
                  onClick={() => handleModeChange("shortBreak")}
                >
                  Short Break
                </Button>
                <Button
                  variant={timerMode === "longBreak" ? "default" : "outline"}
                  onClick={() => handleModeChange("longBreak")}
                >
                  Long Break
                </Button>
              </div>
            )}

            {/* Category Selection */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative h-80 w-80">
                {/* Progress Circle */}
                <svg
                  className="-rotate-90 h-full w-full transform"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="text-blue-600 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-bold text-6xl">{formatTime(time)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="px-8 py-3 font-semibold text-lg"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">PAUSE</span>
                  ) : (
                    <span className="flex items-center gap-2">START</span>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="h-fit p-6">
          <CardContent className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "todo" ? "default" : "outline"}
                onClick={() => setViewMode("todo")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Simple Todo
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                onClick={() => setViewMode("kanban")}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban Board
              </Button>
            </div>

            {/* Render based on view mode */}
            {viewMode === "todo" ? (
              <SimpleTodoView
                tasks={tasks}
                newTask={newTask}
                selectedCategory={selectedCategory}
                setNewTask={setNewTask}
                setSelectedCategory={setSelectedCategory}
                addTask={addTask}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteTask={deleteTask}
              />
            ) : (
              <KanbanBoardView
                tasks={tasks}
                newTask={newTask}
                setNewTask={setNewTask}
                addTask={addTask}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
