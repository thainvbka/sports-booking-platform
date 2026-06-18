import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type RibbonTone = "amber" | "slate" | "rose";

interface StatusRibbonProps {
  tone: RibbonTone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export function StatusRibbon({
  tone,
  icon: Icon,
  title,
  description,
}: StatusRibbonProps) {
  const tones: Record<
    RibbonTone,
    { wrap: string; bar: string; icon: string; title: string }
  > = {
    amber: {
      wrap: "border-amber-500/30 bg-amber-500/8 text-amber-900 dark:text-amber-200",
      bar: "bg-amber-500",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-700 dark:text-amber-300",
    },
    slate: {
      wrap: "border-slate-500/30 bg-slate-500/8 text-slate-900 dark:text-slate-200",
      bar: "bg-slate-500",
      icon: "text-slate-600 dark:text-slate-300",
      title: "text-slate-700 dark:text-slate-300",
    },
    rose: {
      wrap: "border-rose-500/30 bg-rose-500/8 text-rose-900 dark:text-rose-200",
      bar: "bg-rose-500",
      icon: "text-rose-600 dark:text-rose-400",
      title: "text-rose-700 dark:text-rose-300",
    },
  };

  const t = tones[tone];

  return (
    <Alert
      className={cn(
        "relative overflow-hidden rounded-2xl border pl-5",
        t.wrap,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", t.bar)}
      />
      <Icon className={cn("size-4", t.icon)} />
      <AlertTitle
        className={cn(
          "font-display text-sm font-bold italic tracking-tight",
          t.title,
        )}
      >
        {title}
      </AlertTitle>
      <AlertDescription className="text-xs leading-relaxed opacity-90">
        {description}
      </AlertDescription>
    </Alert>
  );
}
