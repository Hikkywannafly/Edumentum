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

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
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

      {/* My Groups */}
      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          My Groups
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {myGroups.map((group) => (
            <div key={group.id} className="cursor-pointer">
              <StudyGroupCard
                publicHidden={false}
                roleHidden={false}
                iStudyGroupCard={group}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Discover Groups */}
      <section>
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          Discover Groups
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="cursor-pointer"
            >
              <StudyGroupCard
                publicHidden={true}
                roleHidden={true}
                iStudyGroupCard={group}
              />
            </div>
          ))}
        </div>
      </section>

      <GroupDialog
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />
    </div>
  );
}
