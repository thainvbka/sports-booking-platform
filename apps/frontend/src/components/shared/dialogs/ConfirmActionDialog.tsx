import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  badgeText?: string;
  alertText: React.ReactNode;
  confirmText: string;
  confirmingText?: string;
  onConfirm: () => Promise<void>;
  icon?: React.ComponentType<{ className?: string }>;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  alertIcon?: React.ComponentType<{ className?: string }>;
  confirmIcon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  variant?: "destructive" | "success";
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  alertText,
  confirmText,
  confirmingText = "Đang xử lý…",
  onConfirm,
  icon: Icon = AlertTriangle,
  alertIcon: AlertIcon,
  confirmIcon: ConfirmIcon,
  children,
  variant = "destructive",
}: ConfirmActionDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Action confirmation failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const ActualAlertIcon = AlertIcon || Icon;
  const isDestructive = variant === "destructive";

  const headerBarClass = isDestructive
    ? "bg-gradient-to-r from-rose-500 via-destructive to-rose-500"
    : "bg-gradient-to-r from-emerald-500 via-primary to-emerald-500";

  const iconContainerClass = isDestructive
    ? "border-destructive/20 bg-destructive/10 text-destructive"
    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

  const alertClass = isDestructive
    ? "border-destructive/25 bg-destructive/5 text-destructive"
    : "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300";

  const alertIconClass = isDestructive
    ? "text-destructive"
    : "text-emerald-600 dark:text-emerald-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[26rem]">
        <div
          aria-hidden
          className={cn("h-1 w-full", headerBarClass)}
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border", iconContainerClass)}>
                <Icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                {/* <Badge
                  variant="outline"
                  className="h-5 w-fit gap-1 rounded-full border-destructive/30 bg-destructive/10 px-2 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-destructive"
                >
                  <BadgeIcon className="size-2.5" />
                  {badgeText}
                </Badge> */}
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

          <Alert className={cn(alertClass)}>
            <ActualAlertIcon className={cn("size-4", alertIconClass)} />
            <AlertDescription className="text-[13px] leading-relaxed text-foreground">
              {alertText}
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConfirming}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant={isDestructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isConfirming}
              className={cn("rounded-full", !isDestructive && "bg-emerald-600 text-white hover:bg-emerald-500")}
            >
              {isConfirming ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  {confirmingText}
                </>
              ) : (
                <>
                  {ConfirmIcon && <ConfirmIcon data-icon="inline-start" />}
                  {confirmText}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
