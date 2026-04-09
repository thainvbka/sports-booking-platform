import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepItem {
  number: number;
  label: string;
}

interface BookingStepperProps {
  currentStep: number;
  steps?: StepItem[];
}

const DEFAULT_STEPS: StepItem[] = [
  { number: 1, label: "Chọn lịch" },
  { number: 2, label: "Add-on" },
  { number: 3, label: "Xác nhận" },
];

export function BookingStepper({
  currentStep,
  steps = DEFAULT_STEPS,
}: BookingStepperProps) {
  return (
    <div className="mb-6 rounded-lg border bg-card p-4">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isDone = currentStep > step.number;
          const showConnector = index < steps.length - 1;

          return (
            <div key={step.number} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-18 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                    isDone && "border-emerald-600 bg-emerald-600 text-white",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    !isDone && !isActive && "border-gray-300 bg-background text-gray-500",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-center text-xs",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {showConnector ? (
                <div
                  className={cn(
                    "mt-3 h-px flex-1",
                    currentStep > step.number ? "bg-emerald-500" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
