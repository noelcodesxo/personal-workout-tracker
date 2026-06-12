"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { NavDrawer } from "./NavDrawer";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils";

interface AppShellProps {
  /** Centered title. Pass `appName` instead to show "ASTRON" in display font. */
  title?: string;
  appName?: boolean;
  /** Right-slot icon button (e.g. + or ✎). */
  rightSlot?: React.ReactNode;
  /** Sticky bottom action area (e.g. primary button). */
  bottomSticky?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function HamburgerIcon() {
  return (
    <div className="flex flex-col gap-1 px-[2px] py-[6px]">
      <span className="block h-[1.5px] w-5 bg-ink" />
      <span className="block h-[1.5px] w-[14px] bg-ink" />
      <span className="block h-[1.5px] w-5 bg-ink" />
    </div>
  );
}

export function AppShell({
  title,
  appName,
  rightSlot,
  bottomSticky,
  className,
  children,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-screen flex-col bg-surface">
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <TopBar
        title={title}
        appName={appName}
        leftSlot={
          <IconButton label="Open menu" onClick={() => setDrawerOpen(true)}>
            <HamburgerIcon />
          </IconButton>
        }
        rightSlot={rightSlot}
      />

      <div className={cn("flex-1 overflow-y-auto scrollbar-none", className)}>{children}</div>

      {bottomSticky && (
        <div className="flex-shrink-0 border-t border-border bg-surface px-6 pb-9 pt-4">
          {bottomSticky}
        </div>
      )}
    </div>
  );
}
