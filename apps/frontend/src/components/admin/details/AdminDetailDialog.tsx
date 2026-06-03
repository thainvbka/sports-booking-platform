import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: LucideIcon;
  statusLabel?: ReactNode;
  statusClassName?: string;
  children: ReactNode;
  contentClassName?: string;
};

export function AdminDetailDialog({
  open,
  onOpenChange,
  title,
  icon: Icon,
  statusLabel,
  statusClassName,
  children,
  contentClassName,
}: AdminDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl overflow-hidden p-0 gap-0 border-none shadow-2xl *:data-[slot='dialog-close']:text-white *:data-[slot='dialog-close']:opacity-100 *:data-[slot='dialog-close']:bg-white/10 *:data-[slot='dialog-close']:hover:bg-white/20 *:data-[slot='dialog-close']:ring-offset-slate-900",
          contentClassName,
        )}
      >
        <DialogHeader className="p-6 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="min-w-0 text-lg font-bold flex items-center gap-2 text-white wrap-break-word">
              {Icon ? <Icon className="w-5 h-5 text-sky-300" /> : null}
              {title}
            </DialogTitle>
            {statusLabel ? (
              <Badge className={cn("border-none shrink-0", statusClassName)}>
                {statusLabel}
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}

type DetailSummaryRowProps = {
  leftLabel: string;
  leftValue: ReactNode;
  rightLabel: string;
  rightValue: ReactNode;
};

export function DetailSummaryRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: DetailSummaryRowProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">
          {leftLabel}
        </p>
        <div className="mt-0.5 wrap-break-word">{leftValue}</div>
      </div>
      <div className="min-w-0 sm:text-right">
        <p className="text-[10px] font-bold text-muted-foreground uppercase">
          {rightLabel}
        </p>
        <div className="mt-0.5 wrap-break-word">{rightValue}</div>
      </div>
    </div>
  );
}

type DetailInfoCardProps = {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
};

export function DetailInfoCard({ label, value, helper }: DetailInfoCardProps) {
  return (
    <div className="min-w-0 rounded-lg border border-border px-3 py-2 bg-muted/20">
      <p className="text-[10px] font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-foreground wrap-break-word">
        {value}
      </div>
      {helper ? (
        <div className="text-xs text-muted-foreground wrap-break-word">
          {helper}
        </div>
      ) : null}
    </div>
  );
}
