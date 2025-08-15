"use client";

import { usePomodoroMini } from "@/hooks/use-pomodoro-mini";
import { PomodoroMiniPlayer } from "./pomodoro-mini-player";

interface PomodoroAppWrapperProps {
  children: React.ReactNode;
}

export function PomodoroAppWrapper({ children }: PomodoroAppWrapperProps) {
  // Sử dụng hook để tự động chuyển mini mode
  usePomodoroMini();

  return (
    <>
      {children}
      <PomodoroMiniPlayer />
    </>
  );
}
