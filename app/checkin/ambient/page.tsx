"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AmbientMeter } from "@/components/AmbientMeter";

type Status = "checking" | "success" | "retry" | "permission-denied";

export default function CheckinAmbientPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [db, setDb] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    void runAmbientCheck();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function runAmbientCheck() {
    setStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      const values: number[] = [];
      const start = performance.now();

      await new Promise<void>((resolve) => {
        const readFrame = () => {
          analyser.getFloatTimeDomainData(data);
          let sum = 0;
          for (let index = 0; index < data.length; index += 1) sum += data[index] * data[index];
          const rms = Math.sqrt(sum / data.length);
          const nextDb = Math.max(0, 20 * Math.log10(rms + 1e-6) + 100);
          values.push(nextDb);
          setDb(nextDb);
          if (performance.now() - start >= 2000) {
            resolve();
            return;
          }
          timeoutRef.current = window.setTimeout(readFrame, 200);
        };
        readFrame();
      });

      stream.getTracks().forEach((track) => track.stop());
      await context.close();
      const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      setDb(average);
      if (average < 45) {
        setStatus("success");
        timeoutRef.current = window.setTimeout(() => router.push("/checkin/vowel"), 1200);
      } else {
        setStatus("retry");
      }
    } catch {
      setStatus("permission-denied");
    }
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-8 py-10 text-center">
      <div className={`mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-8 ${
        status === "success" ? "border-green-300 bg-green-50" : status === "retry" ? "border-red-200 bg-red-50" : "animate-pulse border-[#1B4332]/20 bg-[#F0FDF4]"
      }`}>
        {status === "success" ? <span className="text-4xl text-green-700">✓</span> : null}
      </div>
      {status === "permission-denied" ? (
        <>
          <h1 className="text-4xl font-semibold">We need microphone access to continue.</h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5563]">
            Please allow microphone access in your browser and refresh this page.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-semibold">Checking your surroundings...</h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5563]">
            {status === "success"
              ? "Good. Nice and quiet."
              : status === "retry"
                ? "It is a little noisy. Please find a quieter spot."
                : "We are reading your room sound level."}
          </p>
          <div className="mt-8">
            <AmbientMeter value={db} />
          </div>
          {status === "retry" ? (
            <button
              type="button"
              onClick={() => void runAmbientCheck()}
              className="mt-8 flex min-h-16 w-full items-center justify-center rounded-xl bg-[#1B4332] px-6 py-4 text-lg font-semibold text-white"
            >
              Try again
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
