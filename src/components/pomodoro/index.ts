export interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  status: "todo" | "inProgress" | "done";
}

export type ViewMode = "todo" | "kanban";

// Re-export from context for convenience
export type {
  Task as PomodoroTask,
  ViewMode as PomodoroViewMode,
} from "@/contexts/pomodoro-context";
