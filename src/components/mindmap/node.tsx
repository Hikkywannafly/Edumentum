import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { memo, useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

const MindMapNode = ({ data }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    data.onChange?.(newLabel);
  };

  const handleAddChild = () => {
    data.onAddChild?.();
  };

  const handleDelete = () => {
    data.onDelete?.();
  };

  const nodeStyle = {
    background: data.background || "hsl(var(--card))",
    color: data.color || "hsl(var(--card-foreground))",
    border: "1px solid hsl(var(--border))",
  };

  return (
    <div
      className="rounded-lg shadow-lg transition-all hover:shadow-xl"
      style={nodeStyle}
    >
      <Handle type="target" position={Position.Top} className="h-2 w-2" />

      <div className="min-w-[120px] max-w-[200px] p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  handleLabelChange(label);
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setLabel(data.label || "");
                }
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddChild}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="cursor-pointer break-words font-medium text-sm"
              onDoubleClick={() => setIsEditing(true)}
            >
              {label || "Double click to edit"}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2" />
    </div>
  );
};

export default memo(MindMapNode);
