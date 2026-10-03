'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_CONFIG } from '@/lib/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ROLE_LABELS } from '@/lib/auth/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? 'LEARNER';
  const items = NAV_CONFIG[role];

  const navContent = (isMobile: boolean) => (
    <nav className="flex flex-col gap-1 pb-4">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        if (collapsed && !isMobile) {
          return (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center rounded-md px-2 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-3 py-5 transition-all',
        collapsed ? 'justify-center px-3' : 'px-5'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="flex flex-col overflow-hidden">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">
            APTIS AI
          </span>
          <span className="truncate text-[11px] font-medium text-sidebar-foreground/50">
            Luyện thi Speaking &amp; Writing
          </span>
        </div>
      )}
    </Link>
  );

  const desktopContent = (
    <div className="flex h-full flex-col">
      {brand}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="rounded-md bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground">
            {ROLE_LABELS[role]}
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 px-3">{navContent(false)}</ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full justify-start gap-3 px-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu nhỏ thanh bên'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">Thu nhỏ</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex lg:flex-col',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {desktopContent}
      </aside>

      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => !open && onMobileClose()}
      >
        <SheetContent
          side="left"
          className="w-72 border-sidebar-border bg-sidebar p-0"
        >
          <SheetTitle className="sr-only">Điều hướng</SheetTitle>
          <button
            onClick={onMobileClose}
            className="absolute right-4 top-4 z-10 rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex h-full flex-col">
            {brand}
            <div className="px-3 pb-2">
              <div className="rounded-md bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground">
                {ROLE_LABELS[role]}
              </div>
            </div>
            <ScrollArea className="flex-1 px-3">{navContent(true)}</ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
