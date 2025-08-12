import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask as deleteTaskService,
  getAllTasks,
  getTaskById,
  updateTask as updateTaskService,
} from "../services/TaskServices";
import type { ITask } from "../types/task";

interface UseTasksProps {
  accessToken: string;
}

interface UseTasksReturn {
  tasks: ITask[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<ITask, "id">) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<ITask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refreshTask: (taskId: string) => Promise<void>;
}

export function useTasks({ accessToken }: UseTasksProps): UseTasksReturn {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getAllTasks(accessToken);

      const processedTasks = fetchedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));

      setTasks(processedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const addTask = useCallback(
    async (task: Omit<ITask, "id">) => {
      try {
        setError(null);
        const newTask = await createTask(task, accessToken);

        const processedTask = {
          ...newTask,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        };

        setTasks((prev) => [processedTask, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
        throw err;
      }
    },
    [accessToken],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<ITask>) => {
      try {
        setError(null);
        const updatedTask = await updateTaskService(
          taskId,
          updates,
          accessToken,
        );

        const processedTask = {
          ...updatedTask,
          dueDate: updatedTask.dueDate
            ? new Date(updatedTask.dueDate)
            : undefined,
        };

        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? processedTask : task)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        throw err;
      }
    },
    [accessToken],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        await deleteTaskService(taskId, accessToken);

        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
        throw err;
      }
    },
    [accessToken],
  );

  const refreshTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null);
        const refreshedTask = await getTaskById(taskId, accessToken);

        const processedTask = {
          ...refreshedTask,
          dueDate: refreshedTask.dueDate
            ? new Date(refreshedTask.dueDate)
            : undefined,
        };

        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? processedTask : task)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refresh task");
        throw err;
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (accessToken) {
      fetchTasks();
    }
  }, [accessToken, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    refreshTask,
  };
}
