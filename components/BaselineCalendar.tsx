import { Check } from "lucide-react";

import { CALIBRATION_DAYS } from "@/lib/config";
import { cn } from "@/lib/utils";

export function BaselineCalendar({ completedDays }: { completedDays: number }) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {Array.from({ length: CALIBRATION_DAYS }, (_, index) => {
        const dayNumber = index + 1;
        const complete = dayNumber <= completedDays;
        const today = dayNumber === Math.min(completedDays + 1, CALIBRATION_DAYS);
        return (
          <div
            key={dayNumber}
            className={cn(
              "flex min-h-28 flex-col items-center justify-center rounded-xl border text-center",
              complete
                ? "border-green-200 bg-green-50"
                : today
                  ? "border-[#1B4332] bg-[#F0FDF4]"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
            )}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              Day {dayNumber}
            </p>
            <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-white">
              {complete ? <Check className="h-5 w-5 text-green-700" /> : <span className="h-3 w-3 rounded-full bg-[#D1D5DB]" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
