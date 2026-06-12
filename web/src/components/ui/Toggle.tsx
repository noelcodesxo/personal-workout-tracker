import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border-dark pb-3",
        className,
      )}
    >
      {label && (
        <span className="font-body text-[14px] font-normal text-ink">{label}</span>
      )}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[22px] w-10 flex-shrink-0 rounded-full transition-colors duration-200",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-accent border border-accent"
            : "bg-gray-200 border border-gray-400",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-[14px] w-[14px] rounded-full transition-all duration-200",
            checked ? "right-[3px] bg-surface" : "left-[3px] bg-gray-400",
          )}
        />
      </button>
    </div>
  );
}
