"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

const screens = [
  {
    heading: "Every morning you record your voice for 60 seconds.",
    body: "You do one sustained Ahhhh and one short reading sample. It works in a quiet room with your phone or laptop microphone."
  },
  {
    heading: "We measure 7 things about your voice that humans cannot hear.",
    body: "These include clarity, steadiness, and tiny changes in pitch and volume. We turn them into numbers so we can track patterns over time."
  },
  {
    heading: "Over 14 days we learn what your voice normally sounds like.",
    body: "That week becomes your personal baseline. We compare you to your own normal voice, not just to other people."
  },
  {
    heading: "After that we watch for gradual changes day by day.",
    body: "Small natural ups and downs are expected. RecurVoice looks for changes that keep building over several days."
  },
  {
    heading: "If something shifts we tell you and your care team in plain English.",
    body: "You will see a simple message, not a diagnosis. If needed, your caregiver can receive the same plain language alert by email."
  }
];

export function HowItWorksExplainer() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const current = screens[index];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.heading}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.24 }}
            className="space-y-6"
          >
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#1B4332]/30 bg-white text-lg font-semibold text-[#1B4332]">
              Illustration placeholder
            </div>
            <h2 className="text-3xl font-semibold text-[#0A0A0A]">{current.heading}</h2>
            <p className="text-lg leading-8 text-[#4B5563]">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-2">
        {screens.map((screen, screenIndex) => (
          <span
            key={screen.heading}
            className={`h-3 w-3 rounded-full ${screenIndex === index ? "bg-[#1B4332]" : "bg-[#D1D5DB]"}`}
          />
        ))}
      </div>
      <Button className="w-full" onClick={() => {
        if (index < screens.length - 1) {
          setIndex(index + 1);
          return;
        }
        router.push("/onboarding/consent");
      }}>
        {index < screens.length - 1 ? "Next" : "Continue"}
      </Button>
    </div>
  );
}
