"use client";

import {
  BookOpen,
  BookIcon as BookReader,
  Calendar,
  ChevronDown,
  Compass,
  CreditCard,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Pin,
  PinOff,
  StickyNote,
  Timer,
  Trello,
  Users,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebar } from "@/components/ui/sidebar";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  badge?: string;
};

type MenuData = {
  [key: string]: MenuItem[];
};

const menuData: MenuData = {
  overview: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Explore",
      url: "/explore",
      icon: Compass,
    },
  ],
  contentCreation: [
    {
      title: "Materials",
      url: "/materials",
      icon: BookOpen,
    },
    {
      title: "Quizzes",
      url: "/quizzes",
      icon: HelpCircle,
    },
    {
      title: "Flashcards",
      url: "/flashcards",
      icon: CreditCard,
    },
    {
      title: "Collections",
      url: "/collections",
      icon: FolderOpen,
    },
  ],
  studyTools: [
    {
      title: "Notes",
      url: "/notes",
      icon: StickyNote,
    },
    {
      title: "Reader",
      url: "/reader",
      icon: BookReader,
      badge: "New",
    },
    {
      title: "Tutors",
      url: "/tutors",
      icon: Users,
      badge: "Beta",
    },
    {
      title: "Pomodoro",
      url: "/pomodoro",
      icon: Timer,
    },
  ],
  planning: [
    {
      title: "Planner",
      url: "/planner",
      icon: Calendar,
    },
    {
      title: "Kanban Board",
      url: "/kanban",
      icon: Trello,
    },
  ],
};

export function AppSidebar() {
  const { setOpen, isMobile } = useSidebar();
  const [isPinned, setIsPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Suppress ResizeObserver errors
  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes(
          "ResizeObserver loop completed with undelivered notifications",
        )
      ) {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handlePinToggle = React.useCallback(() => {
    setIsPinned((prev) => {
      const newPinned = !prev;
      if (newPinned) {
        setOpen(true);
      }
      return newPinned;
    });
  }, [setOpen]);

  const handleMouseEnter = React.useCallback(() => {
    if (!isPinned && !isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsHovered(true);
      setOpen(true);
    }
  }, [isPinned, isMobile, setOpen]);

  const handleMouseLeave = React.useCallback(() => {
    if (!isPinned && !isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setOpen(false);
      }, 100);
    }
  }, [isPinned, isMobile, setOpen]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isExpanded = isPinned || isHovered;
  const textVisibility = isExpanded
    ? "opacity-100"
    : "opacity-0 w-0 overflow-hidden";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${isPinned ? "relative" : "fixed top-0 left-0 z-50"} h-full bg-white transition-all duration-200 ease-in-out dark:bg-gray-900`}
    >
      <div
        className={`h-full transition-all duration-200 ease-in-out ${isPinned ? "w-64" : isHovered ? "w-64" : "w-16"}
          ${isHovered && !isPinned ? "bg-white shadow-lg dark:bg-gray-900" : "bg-white dark:bg-gray-900"}
        `}
      >
        <div className="h-full border-gray-200 border-r bg-white dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="h-16 border-gray-200 border-b dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span
                  className={`font-semibold text-lg transition-opacity duration-200 ${textVisibility}`}
                >
                  Edumentum
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 opacity-70 transition-opacity duration-200 hover:opacity-100 ${textVisibility}`}
                onClick={handlePinToggle}
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <Pin className="h-4 w-4 text-blue-600" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto px-2 py-2">
            {Object.entries(menuData).map(([key, items]) => (
              <Collapsible key={key} defaultOpen className="group/collapsible">
                <div className="relative flex w-full min-w-0 flex-col p-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 font-medium text-gray-500 text-xs hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    <span
                      className={`transition-opacity duration-200 ${textVisibility}`}
                    >
                      {key === "overview" && "OVERVIEW"}
                      {key === "contentCreation" && "CONTENT CREATION"}
                      {key === "studyTools" && "STUDY TOOLS"}
                      {key === "planning" && "PLANNING & ORGANIZATION"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180 ${textVisibility}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="w-full text-sm">
                      <ul className="flex w-full min-w-0 flex-col gap-1">
                        {items.map((item) => (
                          <li
                            key={item.title}
                            className="group/menu-item relative"
                          >
                            <a
                              href={item.url}
                              className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-gray-100 focus-visible:ring-2 active:bg-gray-100 dark:active:bg-gray-800 dark:hover:bg-gray-800"
                              title={!isExpanded ? item.title : undefined}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span
                                className={`transition-opacity duration-200 ${textVisibility}`}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <span
                                  className={`rounded-full bg-blue-500 px-2 py-0.5 text-white text-xs transition-opacity duration-200 ${textVisibility}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
