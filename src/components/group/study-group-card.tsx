"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, Lock, Users } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import type { GroupResponse } from "../../types/group";

interface CheckRoleProps {
  ownerId: number;
}

function CheckRole({ ownerId }: CheckRoleProps) {
  const { user } = useAuth();
  if (!user) return null;

  const isOwner = user.userId === ownerId;

  return (
    <Badge
      variant={isOwner ? "secondary" : "outline"}
      className={`ml-2 rounded-full px-3 py-0.5 font-semibold text-xs tracking-wide ${
        isOwner
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          : ""
      }`}
    >
      {isOwner ? "OWNER" : "MEMBER"}
    </Badge>
  );
}

interface StudyGroupCardProps {
  iStudyGroupCard: GroupResponse;
  roleHidden: boolean;
  publicHidden: boolean;
  onClick?: (group: GroupResponse) => void;
}

export function StudyGroupCard({
  iStudyGroupCard,
  roleHidden,
  publicHidden,
  onClick,
}: StudyGroupCardProps) {
  return (
    <Card
      onClick={() => onClick?.(iStudyGroupCard)}
      className="w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-4 text-black shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
    >
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <CardTitle
            className="line-clamp-2 font-semibold text-base leading-snug"
            title={iStudyGroupCard.name}
          >
            {iStudyGroupCard.name}
          </CardTitle>
          {!publicHidden &&
            (iStudyGroupCard.public ? (
              <Globe className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
            ) : (
              <Lock className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
            ))}
        </div>
        {iStudyGroupCard.description && (
          <CardDescription
            className="mt-1 line-clamp-2 text-gray-600 text-sm leading-snug dark:text-gray-300"
            title={iStudyGroupCard.description}
          >
            {iStudyGroupCard.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex items-center justify-between px-0 text-gray-600 text-sm dark:text-gray-300">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span className="font-medium">{iStudyGroupCard.memberCount}/50</span>
        </div>
        {!roleHidden && <CheckRole ownerId={iStudyGroupCard.ownerId} />}
      </CardContent>
    </Card>
  );
}
