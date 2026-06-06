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
    <div
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm md:p-5"
      role="region"
      aria-label="Tiến trình đặt sân"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary/5 to-transparent"
      />
      <ol className="relative flex items-center" aria-label="Các bước đặt sân">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isDone = currentStep > step.number;
          const isFuture = !isActive && !isDone;
          const showConnector = index < steps.length - 1;

          return (
            <li
              key={step.number}
              className="flex min-w-0 flex-1 items-center"
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* Step badge */}
                <div
                  className={cn(
                    "relative flex size-9 shrink-0 items-center justify-center rounded-full border font-display text-sm font-black italic tabular-nums transition-all",
                    isDone &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_theme(colors.primary.DEFAULT)]",
                    isActive &&
                      "border-transparent bg-gradient-to-br from-primary to-accent-sport text-primary-foreground shadow-[0_8px_20px_-8px_theme(colors.primary.DEFAULT)]",
                    isFuture &&
                      "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <>
                      <Check className="size-4" strokeWidth={3} />
                      <span className="sr-only">Đã hoàn thành</span>
                    </>
                  ) : (
                    step.number
                  )}
                  {isActive ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/20 blur-md"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Bước {step.number}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs font-semibold md:text-sm",
                      isActive
                        ? "font-display italic text-foreground"
                        : isDone
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {showConnector ? (
                <div
                  className={cn(
                    "relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border/70",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
                      currentStep > step.number
                        ? "w-full bg-gradient-to-r from-primary to-accent-sport"
                        : "w-0 bg-transparent",
                    )}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
