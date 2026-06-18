import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface FormDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGradientClass?: string;
  maxWidthClass?: string;
  formId: string;
  isSubmitting: boolean;
  submitLabel: React.ReactNode;
  submittingLabel?: string;
  submitButtonClassName?: string;
  children: React.ReactNode;
}

export function FormDialogShell({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  accentGradientClass = "bg-gradient-to-r from-primary via-emerald-500 to-primary",
  maxWidthClass = "sm:max-w-[32rem]",
  formId,
  isSubmitting,
  submitLabel,
  submittingLabel = "Đang xử lý…",
  submitButtonClassName,
  children,
}: FormDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("overflow-hidden p-0", maxWidthClass)}>
        <div
          aria-hidden
          className={cn("h-1 w-full", accentGradientClass)}
        />

        <div className="flex flex-col gap-5 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <DialogTitle className="font-display text-lg font-black italic tracking-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {children}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting}
              className={cn("rounded-full", submitButtonClassName)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  {submittingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
