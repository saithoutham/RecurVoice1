"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const steps = [
  "/demo/start",
  "/demo/ambient",
  "/demo/vowel",
  "/demo/reading",
  "/demo/illness",
  "/demo/processing",
  "/demo/result"
];

export function DemoShell({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? "";
  const index = Math.max(0, steps.findIndex((step) => pathname.startsWith(step)));
  const progress = ((index + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-full border border-moss/10 bg-white/80 px-5 py-4 shadow-panel backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.24em] text-moss/55">
            <span>RecurVoice demo</span>
            <span>Step {index + 1} of {steps.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sage/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-moss to-[#2b6a50] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
