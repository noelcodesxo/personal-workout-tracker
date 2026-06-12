import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({
  message = "Something went wrong. Check your connection and try again.",
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "mx-6 my-4 flex items-center justify-between rounded border border-danger/30 bg-danger/5 px-4 py-3",
        className,
      )}
    >
      <p className="font-body text-[12px] text-danger">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 flex-shrink-0 font-body text-[11px] font-medium tracking-[0.1em] uppercase text-danger cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
