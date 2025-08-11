import type * as React from "react";

import { CircleIcon } from "lucide-react";

export type FeatureItemData = {
  id: number;
  title: string;
  desc: string;
};

type FeatureItemProps = {
  data: FeatureItemData;
};

export function FeatureItem({ data }: FeatureItemProps): React.ReactElement {
  const { title, desc } = data;

  return (
    <li className="group sm:hover:-translate-x-1 ml-2 flex flex-col text-sm transition-all delay-75 duration-300 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-foreground/60 group-hover:text-foreground">
        <CircleIcon size={8} />
        <span className="font-medium">{title}</span>
      </div>
      <span className="mt-1 ml-4 text-muted-foreground sm:mt-0 sm:ml-2 sm:hidden sm:group-hover:inline">
        {desc}
      </span>
    </li>
  );
}
