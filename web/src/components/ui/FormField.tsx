import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, className, children }: FormFieldProps) {
  return (
    <label className={cn("mb-9 block", className)}>
      <span className="mb-[10px] block font-body text-[10px] font-medium tracking-[0.2em] uppercase text-accent opacity-70">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-2 block font-body text-[11px] text-danger" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

interface UnderlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function UnderlineInput({ hasError, className, ...props }: UnderlineInputProps) {
  return (
    <input
      className={cn(
        "w-full border-b bg-transparent pb-3",
        "font-body text-[16px] font-normal tracking-[0.01em] text-ink",
        "placeholder:text-gray-400",
        "outline-none focus:border-b-ink",
        hasError ? "border-b-danger" : "border-b-border-dark",
        className,
      )}
      {...props}
    />
  );
}

interface UnderlineTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function UnderlineTextArea({ hasError, className, ...props }: UnderlineTextAreaProps) {
  return (
    <textarea
      className={cn(
        "w-full resize-none border-b bg-transparent pb-3",
        "font-body text-[16px] font-normal tracking-[0.01em] text-ink",
        "placeholder:text-gray-400",
        "outline-none focus:border-b-ink",
        hasError ? "border-b-danger" : "border-b-border-dark",
        className,
      )}
      {...props}
    />
  );
}
