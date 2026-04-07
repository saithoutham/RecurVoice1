"use client";

import { useRouter } from "next/navigation";

import { setCheckinIllnessFlag } from "@/lib/checkin-session";

export default function CheckinIllnessPage() {
  const router = useRouter();

  function choose(value: boolean) {
    setCheckinIllnessFlag(value);
    router.push("/checkin/processing");
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-8">
      <h1 className="text-center text-4xl font-semibold">One quick question</h1>
      <p className="mt-4 text-center text-lg leading-8 text-[#4B5563]">
        Are you feeling sick today? A cold, sore throat, or allergies can affect your voice.
      </p>
      <div className="mt-8 space-y-4">
        <button type="button" onClick={() => choose(true)} className="flex min-h-16 w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-4 text-lg font-semibold text-[#0A0A0A]">
          Yes, I&apos;m not feeling well today
        </button>
        <button type="button" onClick={() => choose(false)} className="flex min-h-16 w-full items-center justify-center rounded-xl bg-[#1B4332] px-6 py-4 text-lg font-semibold text-white">
          No, I feel fine
        </button>
      </div>
    </div>
  );
}
