"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Lock, Users } from "lucide-react";
import { useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";

interface GroupDialogProps {
  selectedGroup: GroupResponse | null;
  onClose: () => void;
  onJoinSuccess: (group: GroupResponse) => void;
}

export default function GroupDialog({
  selectedGroup,
  onClose,
  onJoinSuccess,
}: GroupDialogProps) {
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!selectedGroup) return;
    try {
      setJoinLoading(true);
      await groupAPI.joinGroup(selectedGroup.id);
      onJoinSuccess(selectedGroup);
      onClose();
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <Dialog open={!!selectedGroup} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <DialogContent className="flex max-h-[85vh] flex-col rounded-2xl bg-card p-6 text-foreground shadow-lg sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold text-lg leading-tight">
            {selectedGroup?.name}
            {selectedGroup?.public ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="mt-1 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {selectedGroup?.description || "No description available."}
        </DialogDescription>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="h-4 w-4" />
          <span>{selectedGroup?.memberCount}/50 members</span>
        </div>

        <DialogFooter className="mt-auto pt-6">
          <Button
            onClick={handleJoinGroup}
            disabled={joinLoading}
            className="w-full font-medium text-sm"
          >
            {joinLoading ? "Requesting..." : "Request to Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
