import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-1 h-[2px] w-8 bg-accent opacity-30" />
      <h3 className="mt-4 font-display text-[18px] font-600 tracking-[0.1em] uppercase text-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-2 font-body text-[13px] text-gray-600 max-w-[260px]">{description}</p>
      )}
      {action && <div className="mt-6 w-full max-w-[280px]">{action}</div>}
    </div>
  );
}
