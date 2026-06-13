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
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  badgeText,
  alertText,
  confirmText,
  confirmingText = "Đang xử lý…",
  onConfirm,
  icon: Icon = AlertTriangle,
  badgeIcon: BadgeIcon = AlertTriangle,
  alertIcon: AlertIcon,
  confirmIcon: ConfirmIcon,
  children,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[26rem]">
        <div
          aria-hidden
          className="h-1 w-full bg-gradient-to-r from-rose-500 via-destructive to-rose-500"
        />

        <div className="flex flex-col gap-4 px-6 py-5">
          <DialogHeader className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
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

          <Alert className="border-destructive/25 bg-destructive/5 text-destructive">
            <ActualAlertIcon className="size-4 text-destructive" />
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
              variant="destructive"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="rounded-full"
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
