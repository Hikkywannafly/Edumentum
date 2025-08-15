"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type React from "react";

interface StatsCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  description?: React.ReactNode;
}

export default function StatsCard({
  title,
  icon,
  value,
  description,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="mb-2 font-bold text-xl">{value}</div>
        {description && (
          <p className="text-gray-500 text-xs dark:text-gray-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
