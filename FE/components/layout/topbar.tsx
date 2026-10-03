"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/types";
import type { Role } from "@/lib/auth/types";
import { getBreadcrumbs } from "@/lib/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

const ROLE_BADGE_STYLES: Record<Role, string> = {
  ADMIN: "border-primary/20 bg-primary/10 text-primary",
  TEACHER: "border-success/20 bg-success/10 text-success",
  LEARNER: "border-warning/20 bg-warning/10 text-warning",
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const role = user?.role ?? "LEARNER";
  const breadcrumbs = getBreadcrumbs(pathname, role);

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "?";

  const handleSignOut = () => {
    signOut();
    toast.success("Đã đăng xuất");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 && (
          <Breadcrumb
            items={breadcrumbs.map((b) => ({
              label: b.label,
              href: b.href,
            }))}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell role={role} />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-medium text-foreground">
                  {user?.name ?? "Khách"}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-0.5 px-1.5 py-0 text-[10px] font-medium",
                    ROLE_BADGE_STYLES[role],
                  )}
                >
                  {user ? ROLE_LABELS[user.role] : ""}
                </Badge>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{user?.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 w-fit px-1.5 py-0 text-[10px] font-medium",
                  ROLE_BADGE_STYLES[role],
                )}
              >
                {user ? ROLE_LABELS[user.role] : ""}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              onClick={() =>
                router.push(
                  role === "TEACHER" ? "/teacher/profile" : "/admin/profile",
                )
              }
            >
              <UserIcon className="h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() =>
                router.push(
                  role === "TEACHER" ? "/teacher/settings" : "/admin/settings",
                )
              }
            >
              <Settings className="h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
