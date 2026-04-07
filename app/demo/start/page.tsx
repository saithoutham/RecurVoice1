"use client";

import { useRouter } from "next/navigation";

import { clearDemoSession, setSessionId } from "@/lib/session";

export default function DemoStartPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md rounded-[34px] border border-moss/10 bg-white p-8 text-center shadow-panel">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sage text-moss">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16a4 4 0 0 0 4-4V9a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4Zm0 0v3m-4 0h8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="font-[var(--font-display)] text-[2rem] leading-tight text-ink">
        Your 60-second voice check-in
      </h1>
      <p className="mt-4 text-lg leading-8 text-moss/65">
        We will ask you to do two quick recordings. Your voice is analyzed entirely in your browser. Nothing is uploaded or stored.
      </p>
      <ul className="mt-8 space-y-3 text-left text-base text-moss/80">
        {[
          "No app to download",
          "No account required",
          "Your audio never leaves your device"
        ].map((item) => (
          <li key={item} className="flex items-center gap-3 rounded-2xl bg-[#F7FAF8] px-4 py-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sage text-moss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 12 4.2 4.2L19 6.4"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-8 flex min-h-16 w-full items-center justify-center rounded-full bg-moss px-6 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-[#143628]"
        onClick={() => {
          clearDemoSession();
          const sessionId = typeof crypto !== "undefined" ? crypto.randomUUID() : `rv-${Date.now()}`;
          setSessionId(sessionId);
          router.push("/demo/ambient");
        }}
      >
        Start check-in
      </button>
    </div>
  );
}
