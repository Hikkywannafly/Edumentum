"use client";

import { usePomodoro } from "@/contexts/pomodoro-context";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function usePomodoroMini() {
  const { isRunning, setIsMini } = usePomodoro();
  const pathname = usePathname();

  useEffect(() => {
    // Nếu không ở trang pomodoro và timer đang chạy, chuyển sang mini mode
    if (!pathname.includes("/pomodoro") && isRunning) {
      setIsMini(true);
    }
  }, [pathname, isRunning, setIsMini]);
}
