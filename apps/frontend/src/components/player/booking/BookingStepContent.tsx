import type { PublicSubfieldDetail, SubfieldProduct } from "@/types";
import { BookingAddonsStep } from "./BookingAddonsStep";
import { BookingConfirmStep } from "./BookingConfirmStep";
import { BookingScheduleStep } from "./BookingScheduleStep";

type BookingType = "single" | "recurring";

interface BookingStepContentProps {
  currentStep: number;
  subfield: PublicSubfieldDetail;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  bookingType: BookingType;
  setBookingType: (type: BookingType) => void;
  setCurrentStep: (step: any) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  recurringType: "WEEKLY" | "MONTHLY";
  setRecurringType: (type: "WEEKLY" | "MONTHLY") => void;
  availableRules: any[];
  customStartTime: string;
  customEndTime: string;
  timeOptions: string[];
  setCustomStartTime: (time: string) => void;
  setCustomEndTime: (time: string) => void;
  validateCustomTime: () => boolean;
  hasUpsellStep: boolean;
  products: SubfieldProduct[];
  addonQuantities: Record<string, number>;
  updateAddonQuantity: (product: SubfieldProduct, delta: number) => void;
  selectedAddons: { product: SubfieldProduct; quantity: number }[];
}

export function BookingStepContent({
  currentStep,
  subfield,
  date,
  setDate,
  bookingType,
  setBookingType,
  setCurrentStep,
  endDate,
  setEndDate,
  recurringType,
  setRecurringType,
  availableRules,
  customStartTime,
  customEndTime,
  timeOptions,
  setCustomStartTime,
  setCustomEndTime,
  validateCustomTime,
  hasUpsellStep,
  products,
  addonQuantities,
  updateAddonQuantity,
  selectedAddons,
}: BookingStepContentProps) {
  return (
    <>
      {currentStep === 1 && (
        <div className="motion-safe-fade-up">
          <BookingScheduleStep
            subfieldId={subfield.id}
            date={date}
            onDateChange={setDate}
            bookingType={bookingType}
            onBookingTypeChange={(type) => {
              setBookingType(type);
              setCurrentStep(1);
            }}
            endDate={endDate}
            onEndDateChange={setEndDate}
            recurringType={recurringType}
            onRecurringTypeChange={setRecurringType}
            availableRules={availableRules}
            customStartTime={customStartTime}
            customEndTime={customEndTime}
            timeOptions={timeOptions}
            onStartTimeChange={setCustomStartTime}
            onEndTimeChange={setCustomEndTime}
            isCustomTimeValid={validateCustomTime()}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div className="motion-safe-fade-up">
          <BookingAddonsStep
            hasUpsellStep={hasUpsellStep}
            products={products}
            addonQuantities={addonQuantities}
            onUpdateAddonQuantity={updateAddonQuantity}
          />
        </div>
      )}

      {currentStep === 3 && (
        <div className="motion-safe-fade-up">
          <BookingConfirmStep
            bookingType={bookingType}
            date={date}
            endDate={endDate}
            customStartTime={customStartTime}
            customEndTime={customEndTime}
            selectedAddons={selectedAddons}
          />
        </div>
      )}
    </>
  );
}
