"use client";

import type * as React from "react";

import { FeatureItem, type FeatureItemData } from "./item";

const features: FeatureItemData[] = [
  {
    id: 1,
    title: "Minimal & sleek",
    desc: "Clean, elegant, and distraction-free design.",
  },
  {
    id: 2,
    title: "Blazing fast",
    desc: "Optimized for speed and performance.",
  },
  {
    id: 3,
    title: "Developer-friendly",
    desc: "Pre-configured with ESLint, Prettier, and Husky.",
  },
  {
    id: 4,
    title: "Fully customizable",
    desc: "Tailwind CSS for rapid styling.",
  },
  {
    id: 5,
    title: "Dark mode support",
    desc: "Seamless light/dark mode switching.",
  },
  {
    id: 6,
    title: "Commit best practices",
    desc: "Built-in commit linting and formatting.",
  },
];

export function FeatureListSection(): React.ReactElement {
  return (
    <section className="flex flex-col">
      <div className="flex flex-col text-pretty">
        <div className="flex flex-col">
          <span className="font-mono text-foreground/60 text-sm">
            Why Minimil stands out?
          </span>
          <h2 className="py-2 font-medium text-sm">Elevating your workflow</h2>
          <hr className="mt-2 border-dashed" />
        </div>

        <ul className="mt-6 flex flex-col gap-1">
          {features.map((feature, i) => (
            <FeatureItem key={i} data={feature} />
          ))}
        </ul>
      </div>
    </section>
  );
}
