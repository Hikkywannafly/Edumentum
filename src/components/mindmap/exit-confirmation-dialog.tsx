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
import { useTranslations } from "next-intl";

interface ExitConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function ExitConfirmationDialog({
  isOpen,
  onClose,
  onSave,
  onDiscard,
}: ExitConfirmationDialogProps) {
  const t = useTranslations("Mindmap");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("editor.exitConfirmationTitle")}</DialogTitle>
          <DialogDescription>
            {t("editor.exitConfirmationDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDiscard}>
            {t("editor.discard")}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t("editor.cancel")}
          </Button>
          <Button onClick={onSave}>{t("editor.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
