"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  description?: string;
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
        <div className="font-bold text-2xl">{value}</div>
        {description && (
          <p className="text-gray-500 text-xs dark:text-gray-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
