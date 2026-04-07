"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const steps = [
  "/checkin",
  "/checkin/ambient",
  "/checkin/vowel",
  "/checkin/reading",
  "/checkin/cough",
  "/checkin/illness",
  "/checkin/processing",
  "/checkin/result"
];

const stepLabels = [
  "Instructions",
  "Room check",
  "Vowel",
  "Reading",
  "Cough",
  "Wellness",
  "Processing",
  "Result"
];

export function CheckinShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  // Use exact matching to prevent /checkin matching all sub-routes
  const index = Math.max(0, steps.findIndex((step) => pathname === step));
  const progress = ((index + 1) / steps.length) * 100;

  return (
    <main className="min-h-[calc(100vh-141px)] bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto max-w-[520px] space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1B4332]">
              Daily check-in
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">
              {index + 1} / {steps.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#1B4332] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < index
                    ? "bg-[#1B4332]"
                    : i === index
                    ? "bg-[#1B4332]/50"
                    : "bg-[#E5E7EB]"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-right text-xs text-[#9CA3AF]">{stepLabels[index]}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
