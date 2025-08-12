import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ITask } from "../../types/task";
import { TaskCard } from "./task-card";

interface DraggableTaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
}

export function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "z-50 opacity-50" : ""}`}
    >
      <TaskCard
        task={task}
        onEdit={(task) => {
          // Prevent edit during drag
          if (!isDragging) {
            onEdit(task);
          }
        }}
        onDelete={(taskId) => {
          if (!isDragging) {
            onDelete(taskId);
          }
        }}
        isDragging={isDragging}
      />
    </div>
  );
}
