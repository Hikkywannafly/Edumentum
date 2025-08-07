"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_ROOT_NODE, useMindmapStore } from "@/stores/mindmap";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function MindmapCreateButton() {
  const t = useTranslations("Mindmap");
  const { setMindmapCurrentFile, setMindmapData } = useMindmapStore();

  const handleCreateMindmap = () => {
    console.log("Creating new mindmap from button...");
    // Reset mindmap data to default
    setMindmapCurrentFile(null);
    setMindmapData([DEFAULT_ROOT_NODE], []);
    window.dispatchEvent(new CustomEvent("new-mindmap"));
  };

  return (
    <Button size="sm" onClick={handleCreateMindmap} className="hidden sm:flex">
      <Plus className="mr-2 h-4 w-4" />
      <span className="hidden md:inline">{t("createMindmap")}</span>
      <span className="md:hidden">Create</span>
    </Button>
  );
}
