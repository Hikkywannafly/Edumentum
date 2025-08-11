import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContextMenuProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onAddChild?: () => void;
  onDelete?: () => void;
  onEditStyle?: () => void;
  onClose: () => void;
}

const ContextMenu = ({
  top,
  left,
  right,
  bottom,
  onAddChild,
  onDelete,
  onEditStyle,
}: ContextMenuProps) => {
  const t = useTranslations("Mindmap");

  return (
    <div
      className="absolute z-50 min-w-[160px] rounded-md border border-border bg-background p-1 shadow-lg"
      style={{
        top: top,
        left: left,
        right: right,
        bottom: bottom,
      }}
    >
      {onAddChild && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddChild}
          className="w-full justify-start"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("contextMenu.addChild")}
        </Button>
      )}
      {onEditStyle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditStyle}
          className="w-full justify-start"
        >
          <Edit className="mr-2 h-4 w-4" />
          {t("contextMenu.editStyle")}
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="w-full justify-start text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("contextMenu.delete")}
        </Button>
      )}
    </div>
  );
};

export default ContextMenu;
