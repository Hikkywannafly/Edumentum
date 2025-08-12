"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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
      className="flex h-[180px] w-full max-w-2xl cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="flex h-full flex-1 flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <CardTitle
            className="line-clamp-1 font-semibold text-lg"
            title={iStudyGroupCard.name}
          >
            {iStudyGroupCard.name}
          </CardTitle>

          {!publicHidden &&
            (iStudyGroupCard.public ? (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-200"
              >
                <Globe className="h-3.5 w-3.5" /> Public
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200"
              >
                <Lock className="h-3.5 w-3.5" /> Private
              </Badge>
            ))}
        </div>

        {/* Description */}
        {iStudyGroupCard.description && (
          <CardDescription
            className="line-clamp-2 text-gray-500 text-sm dark:text-gray-300"
            title={iStudyGroupCard.description}
          >
            {iStudyGroupCard.description}
          </CardDescription>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-gray-600 text-sm dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {iStudyGroupCard.memberCount} / {iStudyGroupCard.memberLimit}
            </span>
          </div>
          {!roleHidden && <CheckRole ownerId={iStudyGroupCard.ownerId} />}
        </div>
      </div>
    </Card>
  );
}
