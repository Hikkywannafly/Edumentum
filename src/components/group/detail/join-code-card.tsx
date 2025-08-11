"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, Copy } from "lucide-react";

interface JoinCodeCardProps {
  code?: string;
}

export default function JoinCodeCard({ code = "" }: JoinCodeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-medium text-sm">Join Code</CardTitle>
        <Clipboard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1 font-mono text-base">
          {code}
        </Badge>
        <Button variant="ghost" size="icon" aria-label="Copy join code">
          <Copy className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
