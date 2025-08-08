"use client";

import { Button } from "@/components/ui/button";
import { KeyRound, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";
import { LocalizedLink } from "../localized-link";
import { StudyGroupCard } from "./study-group-card";

export default function GroupContent() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const [allGroups, myGroups] = await Promise.all([
          groupAPI.getGroups(),
          groupAPI.getMyGroups(),
        ]);
        setGroups(allGroups);
        setMyGroups(myGroups);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Study Groups</h1>
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

      {!loading && !error && (
        <>
          <section className="mb-10">
            <h2 className="mb-4 font-semibold text-xl">My Groups</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {myGroups.map((group) => (
                <StudyGroupCard
                  publicHidden={false}
                  roleHidden={false}
                  key={group.id}
                  iStudyGroupCard={group}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-semibold text-xl">Discover Groups</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {groups.map((group) => (
                <StudyGroupCard
                  publicHidden={true}
                  roleHidden={true}
                  key={group.id}
                  iStudyGroupCard={group}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
