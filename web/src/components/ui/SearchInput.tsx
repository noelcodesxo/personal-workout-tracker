"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ containerClassName, className, ...props }, ref) => (
    <div className={cn("border-b border-border px-6 pb-0 pt-2", containerClassName)}>
      <div className="flex items-center gap-[10px] border-b border-border-dark pb-[14px]">
        <svg
          className="flex-shrink-0 text-gray-400"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          ref={ref}
          type="search"
          className={cn(
            "flex-1 bg-transparent outline-none",
            "font-body text-[14px] font-light tracking-[0.02em] text-ink",
            "placeholder:text-gray-400",
            className,
          )}
          {...props}
        />
      </div>
    </div>
  ),
);
SearchInput.displayName = "SearchInput";
