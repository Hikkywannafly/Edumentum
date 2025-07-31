export interface Task {
  id: string
  text: string
  category: string
  completed: boolean
  status: "todo" | "inProgress" | "done"
}

export type ViewMode = "todo" | "kanban"
