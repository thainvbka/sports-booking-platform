import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  className?: string;
  variant?: "block" | "fullscreen";
}

export function LoadingState({
  text = "Đang tải dữ liệu...",
  className,
  variant = "block",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        variant === "fullscreen"
          ? "fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background text-center"
          : "flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-2 px-6 py-12 text-center",
        className,
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          variant === "fullscreen" ? "h-12 w-12" : "h-5 w-5",
        )}
      />
      <p
        className={cn(
          "text-muted-foreground",
          variant === "fullscreen" ? "mt-4 text-lg font-medium" : "text-sm",
        )}
      >
        {text}
      </p>
    </div>
  );
}
