"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function SettingMenu() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get user initials from username or email
  const getInitials = (username?: string, email?: string) => {
    if (username) {
      return username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "US"; // Default fallback
  };

  const initials = getInitials(user?.username, user?.email);
  const displayName = user?.username || user?.email || "User";

  const handleProfileClick = () => {
    const locale = getLocaleFromPathname(pathname);
    router.push(`/${locale}/profile`);
  };

  const handleSettingsClick = () => {
    const locale = getLocaleFromPathname(pathname);
    router.push(`/${locale}/settings`);
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        disabled
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="font-medium text-xs">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{displayName}</p>
            {user?.email && (
              <p className="text-muted-foreground text-xs leading-none">
                {user.email}
              </p>
            )}
            {user?.roles && user.roles.length > 0 && (
              <p className="text-muted-foreground text-xs leading-none">
                {user.roles
                  .map((role) => role.name.replace("ROLE_", ""))
                  .join(", ")}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleProfileClick}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
