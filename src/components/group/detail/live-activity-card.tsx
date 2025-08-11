"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wifi } from "lucide-react";

export default function LiveActivityCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <Wifi className="h-4 w-4 text-green-500" /> Live Activity
        </CardTitle>
        <div className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
          <Users className="h-4 w-4" /> 0 online
          <Badge variant="secondary" className="ml-2">
            Members only
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex h-24 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
        <Users className="mb-2 h-12 w-12" />
        <p>No one else is online right now</p>
        <p>Be the first to start studying!</p>
      </CardContent>
    </Card>
  );
}
