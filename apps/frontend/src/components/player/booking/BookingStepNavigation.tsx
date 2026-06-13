import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface BookingStepNavigationProps {
  currentStep: number;
  isSubmitting: boolean;
  canConfirm: boolean;
  onBack: () => void;
  onNext: () => void;
  onConfirm: () => void;
}

export function BookingStepNavigation({
  currentStep,
  isSubmitting,
  canConfirm,
  onBack,
  onNext,
  onConfirm,
}: BookingStepNavigationProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse items-stretch gap-2 border-t border-dashed border-border/70 pt-4",
        "sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1 || isSubmitting}
        className="w-full sm:w-auto"
      >
        <ArrowLeft data-icon="inline-start" />
        Quay lại
      </Button>

      {currentStep < 3 ? (
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Tiếp tục
          <ArrowRight data-icon="inline-end" />
        </Button>
      ) : (
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting || !canConfirm}
          onClick={onConfirm}
        >
          {isSubmitting ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Đang tạo booking...
            </>
          ) : (
            <>
              Xác nhận & thanh toán
              <ArrowRight data-icon="inline-end" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
