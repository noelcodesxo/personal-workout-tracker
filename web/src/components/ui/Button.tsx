import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth = false, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded transition-opacity",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && [
          "bg-accent text-surface shadow-glow",
          "px-6 py-[18px] text-[12px] font-medium tracking-[0.18em] uppercase",
          "font-body",
        ],
        variant === "destructive" && [
          "bg-transparent text-gray-600",
          "px-4 py-4 text-[12px] font-normal tracking-[0.1em] uppercase",
          "font-body",
        ],
        fullWidth && "block w-full text-center",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
