import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bolt, Star, Target, Trophy } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: "trophy" | "bolt" | "star" | "target";
  iconColor: string;
}

const IconMap = {
  trophy: Trophy,
  bolt: Bolt,
  star: Star,
  target: Target,
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  iconColor,
}: StatsCardProps) {
  const IconComponent = IconMap[icon];
  return (
    <Card className="border-gray-300 bg-white text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-gray-600 text-sm dark:text-zinc-400">
          {title}
        </CardTitle>
        <IconComponent className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="text-gray-600 text-xs dark:text-zinc-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
