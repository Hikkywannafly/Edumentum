"use client";

import { Button } from "@/components/ui/button";
import { KeyRound, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";
import { LocalizedLink } from "../localized-link";
import GroupDialog from "./group-dialog";
import { StudyGroupCard } from "./study-group-card";

export default function GroupContent() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(
    null,
  );

  useEffect(() => {
    const fetchGroups = async () => {
      const [allGroups, myGroupsData] = await Promise.all([
        groupAPI.getGroups(),
        groupAPI.getMyGroups(),
      ]);
      setGroups(allGroups);
      setMyGroups(myGroupsData);
    };
    fetchGroups();
  }, []);

  const renderGroupList = (
    list: GroupResponse[],
    isMyGroup: boolean,
    onClick?: (group: GroupResponse) => void,
  ) =>
    list.length > 0 ? (
      list.map((group) => (
        <div
          key={group.id}
          onClick={onClick ? () => onClick(group) : undefined}
          className="cursor-pointer"
        >
          {isMyGroup ? (
            <LocalizedLink href={`/group/${group.id}`}>
              <StudyGroupCard
                publicHidden={false}
                roleHidden={false}
                iStudyGroupCard={group}
              />
            </LocalizedLink>
          ) : (
            <StudyGroupCard publicHidden roleHidden iStudyGroupCard={group} />
          )}
        </div>
      ))
    ) : (
      <div className="py-4 text-center text-gray-500">Không có dữ liệu</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            Study Groups
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create or join study groups to compete and learn together with
            friends.
          </p>
        </div>
        <div className="mt-4 flex gap-2 md:mt-0">
          <Button variant="outline">
            <KeyRound className="mr-2 h-4 w-4" />
            Join with Code
          </Button>
          <LocalizedLink href="group/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </LocalizedLink>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          My Groups
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {renderGroupList(myGroups, true)}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          Discover Groups
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {renderGroupList(groups, false, setSelectedGroup)}
        </div>
      </section>

      <GroupDialog
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onJoinSuccess={(group) => {
          setMyGroups((prev) => [...prev, group]);
          setGroups((prev) => prev.filter((g) => g.id !== group.id));
        }}
      />
    </div>
  );
}
