"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AmbientMeter } from "@/components/AmbientMeter";

type Status = "checking" | "success" | "retry" | "permission-denied";

export default function AmbientPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [db, setDb] = useState(0);
  const pulseRef = useRef<number | null>(null);

  useEffect(() => {
    void runAmbientCheck();
    return () => {
      if (pulseRef.current) window.clearTimeout(pulseRef.current);
    };
  }, []);

  async function runAmbientCheck() {
    setStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Float32Array(analyser.fftSize);
      const values: number[] = [];
      const start = performance.now();

      await new Promise<void>((resolve) => {
        const readFrame = () => {
          analyser.getFloatTimeDomainData(data);
          let sum = 0;
          for (let index = 0; index < data.length; index += 1) {
            sum += data[index] * data[index];
          }
          const rms = Math.sqrt(sum / data.length);
          const nextDb = Math.max(0, 20 * Math.log10(rms + 1e-6) + 100);
          values.push(nextDb);
          setDb(nextDb);

          if (performance.now() - start >= 2000) {
            resolve();
            return;
          }
          pulseRef.current = window.setTimeout(readFrame, 200);
        };
        readFrame();
      });

      stream.getTracks().forEach((track) => track.stop());
      await context.close();

      const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      setDb(average);
      if (average < 45) {
        setStatus("success");
        pulseRef.current = window.setTimeout(() => router.push("/demo/vowel"), 1500);
      } else {
        setStatus("retry");
      }
    } catch {
      setStatus("permission-denied");
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-[34px] border border-moss/10 bg-white px-8 py-10 text-center shadow-panel">
      <div
        className={`mb-8 flex h-40 w-40 items-center justify-center rounded-full border-8 transition-all ${
          status === "success"
            ? "border-moss bg-sage"
            : status === "retry"
              ? "border-red-300 bg-red-50"
              : "animate-pulse border-moss/20 bg-sage/50"
        }`}
      >
        {status === "success" ? (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-moss">
            <path
              d="m5 12 4.2 4.2L19 6.4"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>

      {status === "permission-denied" ? (
        <>
          <h1 className="font-[var(--font-display)] text-4xl text-ink">Microphone access needed</h1>
          <p className="mt-4 text-lg leading-8 text-moss/70">
            We need microphone access to continue. Please allow microphone access in your browser and refresh.
          </p>
          <a
            href="https://support.google.com/chrome/answer/2693767"
            target="_blank"
            rel="noreferrer"
            className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-moss"
          >
            Browser help
          </a>
        </>
      ) : (
        <>
          <h1 className="font-[var(--font-display)] text-4xl text-ink">Checking your surroundings...</h1>
          <p className="mt-3 text-base leading-7 text-moss/60">
            {status === "success"
              ? "Good. Nice and quiet."
              : status === "retry"
                ? "It is a little noisy. Please find a quieter spot."
                : "We are reading your room level in real time."}
          </p>
          <div className="mt-8 w-full">
            <AmbientMeter value={db} />
          </div>
          {status === "retry" ? (
            <button
              type="button"
              onClick={() => void runAmbientCheck()}
              className="mt-8 flex min-h-16 w-full items-center justify-center rounded-full bg-moss px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
            >
              Try again
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
