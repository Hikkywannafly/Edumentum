"use client";

import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  AccessDeniedError,
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "@/services/TaskServices";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { ITask } from "../../types/task";
import { Button } from "../ui/button";
import { AddTaskModal } from "./add-task-modal";
import { TaskCard } from "./task-card";
import { UpdateTaskModal } from "./update-task-modal";

// Import drag and drop libraries
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

export default function KanbanContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  // Drag and drop states
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [draggedTaskOriginalStatus, setDraggedTaskOriginalStatus] = useState<
    ITask["status"] | null
  >(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px movement required to start drag
      },
    }),
  );

  useEffect(() => {
    if (!accessToken) return;
    fetchTasks();
  }, [accessToken]);

  const fetchTasks = async () => {
    try {
      if (!accessToken) throw new Error("Access token is missing");
      const response = await getAllTasks(accessToken);
      const tasksWithParsedDates = response.data.map((task: any) => {
        const date = new Date(task.dueDate);
        const offset = date.getTimezoneOffset();
        return {
          ...task,
          dueDate: new Date(date.getTime() - offset * 60 * 1000),
        };
      });
      setTasks(tasksWithParsedDates);
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view these tasks.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (newTask: Omit<ITask, "id">) => {
    if (!accessToken) return;

    try {
      const response = await createTask(
        {
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          dueDate: newTask.dueDate,
        },
        accessToken,
      );
      const date = new Date(response.data.dueDate);
      const offset = date.getTimezoneOffset();

      const taskWithParsedDate = {
        ...response.data,
        dueDate: new Date(date.getTime() - offset * 60 * 1000),
      };
      setTasks((prev) => [...prev, taskWithParsedDate]);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to create tasks.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditTask = (task: ITask) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ITask>) => {
    if (!accessToken) return;

    try {
      const response = await updateTask(
        taskId,
        {
          ...updates,
          dueDate: updates.dueDate,
        },
        accessToken,
      );

      const date = new Date(response.data.dueDate);
      const offset = date.getTimezoneOffset();
      const taskWithParsedDate = {
        ...response.data,
        dueDate: new Date(date.getTime() - offset * 60 * 1000),
      };

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? taskWithParsedDate : task)),
      );
      setSelectedTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to update this task.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!accessToken) return;

    try {
      await deleteTask(taskId, accessToken);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to delete this task.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
    setDraggedTaskOriginalStatus(task?.status || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !draggedTaskOriginalStatus) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    // Check if we're dropping over a column
    const newStatus = over.id as ITask["status"];
    if (
      ["TODO", "IN_PROGRESS", "DONE"].includes(newStatus) &&
      activeTask.status !== newStatus
    ) {
      // Update task status locally for immediate visual feedback
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === active.id ? { ...task, status: newStatus } : task,
        ),
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over || !draggedTaskOriginalStatus) {
      setDraggedTaskOriginalStatus(null);
      return;
    }

    const newStatus = over.id as ITask["status"];

    // Only update if status actually changed and is a valid column
    if (
      ["TODO", "IN_PROGRESS", "DONE"].includes(newStatus) &&
      draggedTaskOriginalStatus !== newStatus
    ) {
      if (!accessToken) {
        // Revert if no access token
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === active.id
              ? { ...task, status: draggedTaskOriginalStatus }
              : task,
          ),
        );
        setDraggedTaskOriginalStatus(null);
        return;
      }

      try {
        // Find the current task with all its data
        const currentTask = tasks.find((task) => task.id === active.id);
        if (!currentTask) {
          setDraggedTaskOriginalStatus(null);
          return;
        }

        const response = await updateTask(
          active.id as string,
          {
            title: currentTask.title,
            description: currentTask.description,
            status: newStatus,
            dueDate: currentTask.dueDate,
          },
          accessToken,
        );

        const date = new Date(response.data.dueDate);
        const offset = date.getTimezoneOffset();
        const taskWithParsedDate = {
          ...response.data,
          dueDate: new Date(date.getTime() - offset * 60 * 1000),
        };

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === active.id ? taskWithParsedDate : task,
          ),
        );

        toast({
          title: "Success",
          description: `Task moved to ${newStatus === "TODO" ? "To Do" : newStatus === "IN_PROGRESS" ? "In Progress" : "Done"}`,
        });
      } catch (error) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === active.id
              ? { ...task, status: draggedTaskOriginalStatus }
              : task,
          ),
        );

        if (error instanceof AccessDeniedError) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to move this task.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to move task",
            variant: "destructive",
          });
        }
      }
    }

    setDraggedTaskOriginalStatus(null);
  };

  const columns: { title: string; status: ITask["status"]; color: string }[] = [
    {
      title: "To Do",
      status: "TODO",
      color: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "In Progress",
      status: "IN_PROGRESS",
      color: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Done",
      status: "DONE",
      color: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="font-bold text-2xl">Kanban Board</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        <div className="mt-4 grid flex-1 grid-cols-1 gap-4 overflow-hidden md:grid-cols-3">
          {columns.map((column) => (
            <DroppableColumn
              key={column.status}
              column={column}
              tasks={tasks.filter((task) => task.status === column.status)}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragging
            />
          </div>
        )}
      </DragOverlay>

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
    </DndContext>
  );
}

// Droppable Column Component
interface DroppableColumnProps {
  column: { title: string; status: ITask["status"]; color: string };
  tasks: ITask[];
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
}

// Import the DraggableTaskCard component
import { DraggableTaskCard } from "./draggable-task-card";

function DroppableColumn({
  column,
  tasks,
  onEdit,
  onDelete,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-0 flex-col rounded-lg border p-4 transition-colors ${
        column.color
      } ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}
    >
      <div className="mb-4 flex flex-shrink-0 items-center justify-between border-b pb-2">
        <h3 className="flex items-center gap-2 font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              column.status === "TODO"
                ? "bg-yellow-500"
                : column.status === "IN_PROGRESS"
                  ? "bg-blue-500"
                  : "bg-green-500"
            }`}
          />
          {column.title}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 font-medium text-xs dark:bg-gray-800">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <SortableContext items={tasks.map((task) => task.id)}>
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-sm dark:text-gray-400">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
