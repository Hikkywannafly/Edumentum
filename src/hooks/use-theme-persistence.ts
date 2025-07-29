"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function useThemePersistence() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (theme && typeof window !== "undefined") {
      localStorage.setItem("edumentum-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("edumentum-theme");
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme, theme]);

  return { theme, setTheme, resolvedTheme };
}
