"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePomodoro } from "@/contexts/pomodoro-context";
import { Maximize2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function PomodoroMiniPlayer() {
  const {
    time,
    isRunning,
    isMini,
    timerType,
    timerMode,
    progress,
    handleStart,
    handleReset,
    setIsMini,
    formatTime,
  } = usePomodoro();

  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState("en");

  // Drag state
  const [position, setPosition] = useState({ x: 6, y: 0 }); // Will be set to bottom-right on mount
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current locale from URL pathname
    const getCurrentLocale = () => {
      const segments = pathname.split("/").filter(Boolean);
      // Check if first segment is a valid locale
      const validLocales = ["en", "vi"];
      const firstSegment = segments[0];

      if (validLocales.includes(firstSegment)) {
        return firstSegment;
      }

      // Fallback to localStorage or default
      return locale;
    };

    // Sync locale state with URL and localStorage
    const currentLocale = getCurrentLocale();
    const savedLocale = localStorage.getItem("edumentum-locale");

    if (currentLocale !== locale) {
      setLocale(currentLocale);
    } else if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale);
    }
  }, [pathname, locale]);

  // Set initial position to bottom-right corner
  useEffect(() => {
    const setBottomRightPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const playerWidth = 240; // w-60 = 240px
      const playerHeight = 200; // Approximate height
      const margin = 24; // Equal margin from right and bottom edges

      setPosition({
        x: viewportWidth - playerWidth - margin, // Equal margin from right edge
        y: viewportHeight - playerHeight - margin, // Equal margin from bottom edge
      });
    };

    // Set position on mount
    setBottomRightPosition();

    // Update position on window resize
    const handleResize = () => {
      setBottomRightPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset position to default when mini mode is disabled
  useEffect(() => {
    if (!isMini) {
      const setBottomRightPosition = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const playerWidth = 240; // w-60 = 240px
        const playerHeight = 200; // Approximate height
        const margin = 24; // Equal margin from right and bottom edges

        setPosition({
          x: viewportWidth - playerWidth - margin, // Equal margin from right edge
          y: viewportHeight - playerHeight - margin, // Equal margin from bottom edge
        });
      };

      setBottomRightPosition();
    }
  }, [isMini]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && playerRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const playerWidth = 240; // w-60 = 240px
        const playerHeight = 200; // Approximate height

        // Constrain to viewport bounds
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - playerWidth),
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - playerHeight),
        );

        setPosition({ x: constrainedX, y: constrainedY });
      }
    },
    [isDragging, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Simple translation function for mini player
  const getTimerModeText = () => {
    if (timerType === "pomodoro") {
      switch (timerMode) {
        case "focus":
          return "FOCUS";
        case "shortBreak":
          return "SHORT BREAK";
        case "longBreak":
          return "LONG BREAK";
        default:
          return "POMODORO";
      }
    }
    return "COUNTDOWN";
  };

  // Don't render if not in mini mode
  if (!isMini) return null;

  return (
    <div
      ref={playerRef}
      className="fixed z-50 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? "none" : "auto",
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="w-60 border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-sm uppercase tracking-wide">
            {getTimerModeText()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dragging when clicking buttons
                setIsMini(false);
                // Navigate to pomodoro page
                // window.location.href = "/pomodoro";
                router.push(`/${locale}/pomodoro`);
              }}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dragging when clicking buttons
                setIsMini(false);
                // Reset timer
                handleReset();
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="mb-4 flex justify-center">
          <span className="font-bold text-4xl tracking-wider">
            {formatTime(time)}
          </span>
        </div>

        {/* Control Button */}
        <div className="mb-4 flex justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent dragging when clicking button
              handleStart();
            }}
            className="px-6 py-2 font-medium"
            size="sm"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">PAUSE</span>
            ) : (
              <span className="flex items-center gap-2">START</span>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full rounded-full bg-gray-200">
          <div
            className="h-1 rounded-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
