"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MindMapType } from "@/lib/api/mindmap";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface SaveMindmapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: MindMapType) => void;
  currentName?: string;
  currentType?: MindMapType;
  isEditing?: boolean;
}

const MINDMAP_TYPES: { value: MindMapType; label: string; labelVi: string }[] =
  [
    { value: "STUDY_NOTES", label: "Study Notes", labelVi: "Ghi chú học tập" },
    {
      value: "PROJECT_PLANNING",
      label: "Project Planning",
      labelVi: "Lập kế hoạch dự án",
    },
    {
      value: "CONCEPT_MAPPING",
      label: "Concept Mapping",
      labelVi: "Sơ đồ khái niệm",
    },
    {
      value: "BRAINSTORMING",
      label: "Brainstorming",
      labelVi: "Brainstorming",
    },
    {
      value: "LESSON_PLAN",
      label: "Lesson Plan",
      labelVi: "Kế hoạch bài giảng",
    },
    { value: "RESEARCH", label: "Research", labelVi: "Nghiên cứu" },
    { value: "PRESENTATION", label: "Presentation", labelVi: "Thuyết trình" },
    { value: "PERSONAL", label: "Personal", labelVi: "Cá nhân" },
  ];

export default function SaveMindmapDialog({
  isOpen,
  onClose,
  onSave,
  currentName = "",
  currentType = "STUDY_NOTES",
  isEditing = false,
}: SaveMindmapDialogProps) {
  const [name, setName] = useState(currentName);
  const [type, setType] = useState<MindMapType>(currentType);
  const [error, setError] = useState("");
  const t = useTranslations("Mindmap");
  const locale = useLocale();

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setType(currentType);
      setError("");
    }
  }, [isOpen, currentName, currentType]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t("editor.nameRequired"));
      return;
    }

    if (
      trimmedName.toLowerCase() === "new mindmap" ||
      trimmedName.toLowerCase() === "sơ đồ tư duy mới"
    ) {
      setError(t("editor.invalidName"));
      return;
    }

    onSave(trimmedName, type);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  // const getTypeLabel = (typeValue: MindMapType) => {
  //   const type = MINDMAP_TYPES.find(t => t.value === typeValue);
  //   return type ? (locale === "vi" ? type.labelVi : type.label) : typeValue;
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editor.editName") : t("editor.saveAs")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("editor.editNameDescription")
              : t("editor.saveAsDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("editor.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyPress={handleKeyPress}
              className="col-span-3"
              placeholder={t("editor.namePlaceholder")}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t("editor.type")}
            </Label>
            <Select
              value={type}
              onValueChange={(value: MindMapType) => setType(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("editor.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {MINDMAP_TYPES.map((typeOption) => (
                  <SelectItem key={typeOption.value} value={typeOption.value}>
                    {locale === "vi" ? typeOption.labelVi : typeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-center text-destructive text-sm">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("editor.cancel")}
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? t("editor.update") : t("editor.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
