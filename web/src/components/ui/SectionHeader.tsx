import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  className?: string;
}

export function SectionHeader({ title, linkLabel, onLinkClick, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-baseline justify-between px-6 pb-4 pt-7", className)}>
      <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gray-600">
        {title}
      </span>
      {linkLabel && (
        <button
          onClick={onLinkClick}
          className="font-body text-[11px] tracking-[0.06em] text-accent opacity-80 cursor-pointer"
        >
          {linkLabel}
        </button>
      )}
    </div>
  );
}
