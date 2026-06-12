"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, className, children }: SheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/28 transition-opacity duration-200",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-[4px] bg-surface",
          "border-t border-border shadow-lg",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-body text-[13px] font-medium tracking-[0.08em] uppercase text-ink">
              {title}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="font-body text-[22px] font-light text-gray-600 cursor-pointer leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-none">{children}</div>
      </div>
    </>
  );
}
