"use client";

import { useRouter } from "next/navigation";

import { setIllnessFlag } from "@/lib/session";

export default function IllnessPage() {
  const router = useRouter();

  function choose(value: boolean) {
    setIllnessFlag(value);
    router.push("/demo/processing");
  }

  return (
    <div className="mx-auto max-w-md rounded-[34px] border border-moss/10 bg-white p-8 shadow-panel">
      <h1 className="text-center font-[var(--font-display)] text-5xl text-ink">
        One quick question
      </h1>
      <p className="mt-4 text-center text-lg leading-8 text-moss/70">
        Are you feeling sick today? A cold, sore throat, or allergies can affect your voice.
      </p>
      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={() => choose(true)}
          className="flex min-h-16 w-full items-center justify-center rounded-full border border-black/10 bg-white px-6 py-4 text-lg font-semibold text-ink transition hover:border-moss/30 hover:bg-[#F8FBF9]"
        >
          Yes, I am not feeling well today
        </button>
        <button
          type="button"
          onClick={() => choose(false)}
          className="flex min-h-16 w-full items-center justify-center rounded-full bg-moss px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
        >
          No, I feel fine
        </button>
      </div>
    </div>
  );
}
