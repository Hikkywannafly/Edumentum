"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type TimerMode = "focus" | "shortBreak" | "longBreak";
export type TimerType = "pomodoro" | "countdown";
export type ViewMode = "todo" | "kanban";

export interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  status: "todo" | "inProgress" | "done";
}

interface PomodoroContextType {
  // Timer state
  timerType: TimerType;
  timerMode: TimerMode;
  countdownMinutes: number;
  time: number;
  isRunning: boolean;
  isMini: boolean;

  // Tasks state
  tasks: Task[];
  newTask: string;
  selectedCategory: string;
  viewMode: ViewMode;

  // Timer actions
  setTimerType: (type: TimerType) => void;
  setTimerMode: (mode: TimerMode) => void;
  setCountdownMinutes: (minutes: number) => void;
  handleStart: () => void;
  handleReset: () => void;
  handleModeChange: (mode: TimerMode) => void;

  // Tasks actions
  setNewTask: (task: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: ViewMode) => void;
  addTask: () => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Mini player actions
  setIsMini: (mini: boolean) => void;
  toggleMini: () => void;

  // Utility
  formatTime: (seconds: number) => string;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined,
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [timerType, setTimerTypeState] = useState<TimerType>("pomodoro");
  const [timerMode, setTimerModeState] = useState<TimerMode>("focus");
  const [countdownMinutes, setCountdownMinutesState] = useState(1);
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMini, setIsMiniState] = useState(false);

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
  const [newTask, setNewTaskState] = useState("");
  const [selectedCategory, setSelectedCategoryState] =
    useState("Uncategorized");
  const [viewMode, setViewModeState] = useState<ViewMode>("todo");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timerModes = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Timer type change handler
  const setTimerType = (type: TimerType) => {
    setTimerTypeState(type);
    setIsRunning(false);
    if (type === "pomodoro") {
      setTimerModeState("focus");
      setTime(timerModes.focus);
    } else if (type === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  // Countdown minutes change handler
  const setCountdownMinutes = (val: number) => {
    setCountdownMinutesState(val);
    if (timerType === "countdown") {
      setTime(val * 60);
      setIsRunning(false);
    }
  };

  // Timer mode change handler
  const setTimerMode = (mode: TimerMode) => {
    setTimerModeState(mode);
    setTime(timerModes[mode]);
    setIsRunning(false);
  };

  // Start/Stop timer
  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    if (timerType === "pomodoro") {
      setTime(timerModes[timerMode]);
    } else if (timerType === "countdown") {
      setTime(countdownMinutes * 60);
    }
  };

  // Mode change handler
  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    setTime(timerModes[mode]);
    setIsRunning(false);
  };

  // Add task
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
      setNewTaskState("");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Mini player actions
  const setIsMini = (mini: boolean) => {
    setIsMiniState(mini);
  };

  const toggleMini = () => {
    setIsMiniState(!isMini);
  };

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  let progress = 0;
  if (timerType === "pomodoro") {
    progress = ((timerModes[timerMode] - time) / timerModes[timerMode]) * 100;
  } else if (timerType === "countdown") {
    progress = ((countdownMinutes * 60 - time) / (countdownMinutes * 60)) * 100;
  }

  // Timer effect
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

  const value: PomodoroContextType = {
    timerType,
    timerMode,
    countdownMinutes,
    time,
    isRunning,
    isMini,
    tasks,
    newTask,
    selectedCategory,
    viewMode,
    setTimerType,
    setTimerMode,
    setCountdownMinutes,
    handleStart,
    handleReset,
    handleModeChange,
    setNewTask: setNewTaskState,
    setSelectedCategory: setSelectedCategoryState,
    setViewMode: setViewModeState,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    setIsMini,
    toggleMini,
    formatTime,
    progress,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
