import * as React from "react";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  value?: string; // HH:MM format
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(
  ({ value = "00:00", onChange, disabled, className, id }, ref) => {
    const [localHours, setLocalHours] = React.useState("");
    const [localMinutes, setLocalMinutes] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync with external value when not focused
    React.useEffect(() => {
      if (!isFocused && value) {
        const parts = value.split(":");
        setLocalHours(parts[0] || "00");
        setLocalMinutes(parts[1] || "00");
      }
    }, [value, isFocused]);

    const updateTime = (newHours: string, newMinutes: string) => {
      onChange?.(`${newHours}:${newMinutes}`);
    };

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, ""); // Only numbers

      // Allow typing up to 2 digits
      if (val.length > 2) return;

      setLocalHours(val);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, ""); // Only numbers

      // Allow typing up to 2 digits
      if (val.length > 2) return;

      setLocalMinutes(val);
    };

    const handleHoursFocus = () => {
      setIsFocused(true);
    };

    const handleHoursBlur = () => {
      let hours = localHours;
      if (!hours) {
        hours = "00";
      } else {
        let num = parseInt(hours);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 23) num = 23;
        hours = num.toString().padStart(2, "0");
      }

      setLocalHours(hours);
      updateTime(hours, localMinutes || "00");
      setIsFocused(false);
    };

    const handleMinutesFocus = () => {
      setIsFocused(true);
    };

    const handleMinutesBlur = () => {
      let minutes = localMinutes;
      if (!minutes) {
        minutes = "00";
      } else {
        let num = parseInt(minutes);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 59) num = 59;
        minutes = num.toString().padStart(2, "0");
      }

      setLocalMinutes(minutes);
      updateTime(localHours || "00", minutes);
      setIsFocused(false);
    };

    const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Jump to minutes on colon or Enter
      if (e.key === ":" || e.key === "Enter") {
        e.preventDefault();
        document.getElementById(`${id}-minutes`)?.focus();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 h-10",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        {/* Hours */}
        <input
          id={`${id}-hours`}
          type="text"
          inputMode="numeric"
          value={localHours}
          onChange={handleHoursChange}
          onFocus={handleHoursFocus}
          onBlur={handleHoursBlur}
          onKeyDown={handleHoursKeyDown}
          disabled={disabled}
          maxLength={2}
          placeholder="08"
          className="w-9 bg-transparent outline-none text-center text-base font-medium placeholder:text-muted-foreground"
        />

        <span className="text-muted-foreground font-semibold select-none">
          :
        </span>

        {/* Minutes */}
        <input
          id={`${id}-minutes`}
          type="text"
          inputMode="numeric"
          value={localMinutes}
          onChange={handleMinutesChange}
          onFocus={handleMinutesFocus}
          onBlur={handleMinutesBlur}
          disabled={disabled}
          maxLength={2}
          placeholder="00"
          className="w-9 bg-transparent outline-none text-center text-base font-medium placeholder:text-muted-foreground"
        />
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";
