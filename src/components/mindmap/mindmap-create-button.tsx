"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function MindmapCreateButton() {
  const t = useTranslations("Mindmap");

  return (
    <LocalizedLink href="/mindmap/create">
      <Button size="sm" className="hidden sm:flex">
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">{t("createMindmap")}</span>
        <span className="md:hidden">Create</span>
      </Button>
    </LocalizedLink>
  );
}
