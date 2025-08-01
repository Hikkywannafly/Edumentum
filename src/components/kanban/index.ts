export interface Task {
  id: string;
  title: string;
  description: string;
  status: "toDo" | "inProgress" | "done";
}
