"use client";

import {} from "@radix-ui/react-dropdown-menu";
import {} from "lucide-react";
import { useTranslations } from "next-intl";
import { AchievementCard } from "./achievement-card";
import AchievementFilter from "./achievement-filter";
import AchievementPaging from "./achievement-paging";
import { StatsCard } from "./starts-card";

export const AchievementsContent = () => {
  const t = useTranslations("Achievements");

  const achievementsData: Array<{
    icon: string;
    title: string;
    tier: string;
    description: string;
    xp: number;
    progressCurrent?: number;
    progressTotal?: number;
    rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  }> = [
    {
      icon: "🎯",
      title: "First Steps",
      tier: "Tier 1",
      description: "Complete your first quiz",
      xp: 10,
      rarity: "COMMON",
    },
    {
      icon: "🎓",
      title: "Flashcard Scholar",
      tier: "Tier 1",
      description: "Study 500 flashcards",
      xp: 75,
      progressCurrent: 0,
      progressTotal: 500,
      rarity: "RARE",
    },
    {
      icon: "🎓",
      title: "Flashcard Student",
      tier: "Tier 1",
      description: "Study 50 flashcards",
      xp: 20,
      progressCurrent: 0,
      progressTotal: 50,
      rarity: "COMMON",
    },
    {
      icon: "🎯",
      title: "Quiz Novice",
      tier: "Tier 1",
      description: "Complete 10 quizzes",
      xp: 25,
      progressCurrent: 9,
      progressTotal: 10,
      rarity: "COMMON",
    },
    {
      icon: "🎨",
      title: "Card Creator",
      tier: "Tier 1",
      description: "Create your first flashcard set",
      xp: 15,
      rarity: "COMMON",
    },
    {
      icon: "🎨",
      title: "Flashcard Architect",
      tier: "Tier 1",
      description: "Create 25 flashcard sets",
      xp: 60,
      progressCurrent: 2,
      progressTotal: 25,
      rarity: "RARE",
    },
    {
      icon: "🎯",
      title: "Quiz Creator",
      tier: "Tier 1",
      description: "Create 5 quizzes",
      xp: 50,
      rarity: "COMMON",
    },
    {
      icon: "🎯",
      title: "Consistent Performer",
      tier: "Tier 1",
      description: "Achieve a 7-day streak",
      xp: 150,
      rarity: "EPIC",
    },
    {
      icon: "🎯",
      title: "Perfectionist",
      tier: "Tier 1",
      description: "Score 100% on a quiz",
      xp: 30,
      rarity: "RARE",
    },
  ];

  const statsData: Array<{
    title: string;
    value: string;
    description: string;
    icon: "trophy" | "bolt" | "star" | "target";
    iconColor: string;
  }> = [
    {
      title: t("stats.totalUnlocked.title"),
      value: "0/26",
      description: t("stats.totalUnlocked.description"),
      icon: "trophy",
      iconColor: "text-yellow-400",
    },
    {
      title: t("stats.xpEarned.title"),
      value: "10",
      description: t("stats.xpEarned.description"),
      icon: "bolt",
      iconColor: "text-blue-400",
    },
    {
      title: t("stats.rarestUnlocked.title"),
      value: "None yet",
      description: t("stats.rarestUnlocked.description"),
      icon: "star",
      iconColor: "text-purple-400",
    },
    {
      title: t("stats.recentProgress.title"),
      value: t("stats.recentProgress.description"),
      description: "",
      icon: "target",
      iconColor: "text-green-400",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <header className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-zinc-900 md:text-4xl dark:text-white">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </section>

      <AchievementFilter />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievementsData.map((achievement, index) => (
          <AchievementCard
            key={index}
            icon={achievement.icon}
            title={achievement.title}
            tier={achievement.tier}
            description={achievement.description}
            xp={achievement.xp}
            progressCurrent={achievement.progressCurrent}
            progressTotal={achievement.progressTotal}
            rarity={achievement.rarity}
          />
        ))}
      </section>

      <AchievementPaging />
    </div>
  );
};
