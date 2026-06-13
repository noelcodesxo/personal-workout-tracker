"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Exercises", href: "/exercises" },
  { label: "Workouts", href: "/workouts" },
  { label: "Routines", href: "/routines" },
] as const;

export function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-10 bg-black/28 transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        id="nav-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed left-0 top-0 z-20 flex h-full w-4/5 max-w-[320px] flex-col bg-surface",
          "border-r border-[#d8d8d8] transition-transform duration-200 ease-out",
          "after:pointer-events-none after:absolute after:right-[-1px] after:top-0",
          "after:h-[40%] after:w-px after:bg-gradient-to-b after:from-accent after:to-transparent",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-5 top-5 cursor-pointer font-body text-[22px] font-light leading-none text-gray-600"
        >
          ×
        </button>

        {/* Header */}
        <div className="border-b border-border bg-grid px-7 pb-7 pt-[52px]">
          <div
            className="mb-[14px] flex h-[52px] w-[52px] items-center justify-center rounded-full border border-accent/30 bg-[var(--accent-dim)]"
            style={{ boxShadow: "0 0 16px var(--accent-soft)" }}
          >
            <span className="font-display text-[22px] font-semibold tracking-[0.04em] text-accent">
              N
            </span>
          </div>
          <div className="font-display text-[28px] font-semibold tracking-[0.04em] text-ink">
            Noel
          </div>
        </div>

        {/* Nav items */}
        <nav aria-label="Main navigation" className="flex-1 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between border-b border-border px-7 py-5 first:border-t",
                  isActive && "border-l-2 border-l-accent bg-[var(--accent-dim)] pl-[26px]",
                )}
              >
                <span
                  className={cn(
                    "font-body text-[16px] tracking-[0.02em]",
                    isActive ? "font-medium text-accent" : "font-normal text-ink",
                  )}
                >
                  {item.label}
                </span>
                <span className={cn("text-[16px]", isActive ? "text-accent" : "text-gray-400")}>
                  →
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-7 pb-12 pt-7">
          <button className="cursor-pointer font-body text-[12px] tracking-[0.14em] uppercase text-gray-600">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
