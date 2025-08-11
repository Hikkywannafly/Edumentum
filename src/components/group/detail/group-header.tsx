"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GroupHeaderProps {
  name?: string;
  description?: string;
}

export default function GroupHeader({ name, description }: GroupHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-bold text-3xl text-gray-900 dark:text-gray-50">
          {name}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <Button className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Join Group
      </Button>
    </header>
  );
}
