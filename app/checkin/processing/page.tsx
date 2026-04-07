"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  concatenateBuffers,
  createAudioContext,
  decodeBlobToAudioBuffer,
  extractFeaturePayload,
  resampleAudioBuffer,
  voiceActivityDetect
} from "@/lib/audio";
import {
  CHECKIN_KEYS,
  getCheckinIllnessFlag,
  readCheckinBlob,
  setCheckinJson
} from "@/lib/checkin-session";

type StepStatus = "waiting" | "active" | "done" | "error";

const STEP_DEFS = [
  { label: "Loading recordings", detail: "Reading your audio from this session." },
  { label: "Isolating voice", detail: "Removing silence and background noise." },
  { label: "Extracting features", detail: "Measuring pitch, roughness, and spectral shape." },
  { label: "Sending to voice engine", detail: "Running acoustic biomarker analysis." },
  { label: "Analyzing cough acoustics", detail: "Sending cough audio to AI assessment engine." },
  { label: "Preparing your results", detail: "Turning numbers into plain English." }
] as const;

function StepRow({ label, detail, status }: { label: string; detail: string; status: StepStatus }) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border px-4 py-3.5 transition-all duration-300 ${
      status === "done"
        ? "border-green-200 bg-green-50"
        : status === "active"
        ? "border-[#1B4332]/25 bg-[#F0FDF4]"
        : status === "error"
        ? "border-red-200 bg-red-50"
        : "border-[#E5E7EB] bg-[#F9FAFB]"
    }`}>
      <div className="mt-0.5 flex-shrink-0">
        {status === "done" ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">✓</div>
        ) : status === "active" ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1B4332]/20 border-t-[#1B4332]" />
        ) : status === "error" ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">✗</div>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-[#E5E7EB] bg-white" />
        )}
      </div>
      <div>
        <p className={`text-sm font-semibold ${
          status === "done" ? "text-green-800" : status === "active" ? "text-[#1B4332]" : status === "error" ? "text-red-800" : "text-[#9CA3AF]"
        }`}>{label}</p>
        {status === "active" && (
          <p className="text-xs text-[#6B7280]">{detail}</p>
        )}
      </div>
    </div>
  );
}

export default function CheckinProcessingPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<StepStatus[]>(["waiting", "waiting", "waiting", "waiting", "waiting", "waiting"]);
  const [error, setError] = useState("");

  function setStep(index: number, status: StepStatus) {
    setStatuses((prev) => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  }

  useEffect(() => {
    void run();
  }, []);

  async function run() {
    let context: AudioContext | null = null;
    try {
      // Step 0: Load
      setStep(0, "active");
      const vowelBlob = readCheckinBlob(CHECKIN_KEYS.vowelBlob);
      const readingBlob = readCheckinBlob(CHECKIN_KEYS.readingBlob);
      if (!vowelBlob || !readingBlob) {
        throw new Error("Recordings not found. Please start the check-in again.");
      }
      const coughBlob = readCheckinBlob(CHECKIN_KEYS.coughBlob); // optional
      setStep(0, "done");

      // Step 1: VAD
      setStep(1, "active");
      context = createAudioContext();
      const vowel = await decodeBlobToAudioBuffer(vowelBlob, context);
      const reading = await decodeBlobToAudioBuffer(readingBlob, context);
      const vowelResampled = await resampleAudioBuffer(vowel, 16000);
      const readingResampled = await resampleAudioBuffer(reading, 16000);
      const joined = concatenateBuffers(vowelResampled, readingResampled, context);
      const vad = voiceActivityDetect(joined.getChannelData(0), 16000, 0.01);
      if (vad.durationSeconds < 1.5) {
        throw new Error("We could not detect enough voice. Please go back and try again.");
      }
      setStep(1, "done");

      // Step 2: Features
      setStep(2, "active");
      const features = await extractFeaturePayload(joined);
      setCheckinJson(CHECKIN_KEYS.features, features);
      setStep(2, "done");

      // Step 3: Voice API
      setStep(3, "active");
      const voiceResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          illness_flag: getCheckinIllnessFlag(),
          features
        })
      });
      const voiceResult = await voiceResponse.json();
      if (!voiceResponse.ok) {
        throw new Error(voiceResult.detail ?? "Voice analysis failed. Please try again.");
      }
      setCheckinJson(CHECKIN_KEYS.result, voiceResult);
      setStep(3, "done");

      // Step 4: Cough API
      setStep(4, "active");
      if (coughBlob) {
        try {
          const coughForm = new FormData();
          coughForm.append("audio_file", coughBlob, "cough.wav");
          coughForm.append("monitoring_day", String(voiceResult.days_recorded ?? 1));
          coughForm.append("calibration_complete", String(voiceResult.baseline_complete ?? false));
          coughForm.append("illness_flag", String(getCheckinIllnessFlag()));
          const coughResponse = await fetch("/api/cough", {
            method: "POST",
            body: coughForm
          });
          if (coughResponse.ok) {
            const coughResult = await coughResponse.json();
            setCheckinJson(CHECKIN_KEYS.coughResult, coughResult);
          }
        } catch {
          // Cough analysis is optional — don't fail the whole check-in
        }
      }
      setStep(4, "done");

      // Step 5: Done
      setStep(5, "active");
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      setStep(5, "done");

      window.setTimeout(() => router.push("/checkin/result"), 400);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Something went wrong. Please try again.";
      setError(msg);
      setStatuses((prev) => prev.map((s) => (s === "active" ? "error" : s)));
    } finally {
      if (context && context.state !== "closed") await context.close();
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          ✗
        </div>
        <h1 className="text-center text-2xl font-bold text-[#0A0A0A]">Something went wrong</h1>
        <p className="mt-3 text-center text-base leading-7 text-[#4B5563]">{error}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/checkin"
            className="flex min-h-12 items-center justify-center rounded-xl border border-[#E5E7EB] px-6 py-3 text-sm font-semibold text-[#4B5563] hover:bg-[#F9FAFB]"
          >
            Start over
          </Link>
          <button
            type="button"
            onClick={() => { setError(""); setStatuses(["waiting","waiting","waiting","waiting","waiting","waiting"]); void run(); }}
            className="flex min-h-12 items-center justify-center rounded-xl bg-[#1B4332] px-6 py-3 text-sm font-semibold text-white hover:bg-[#14532D]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#D1FAE5] border-t-[#1B4332]" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#0A0A0A]">Analyzing your check-in</h1>
        <p className="mt-2 text-sm text-[#6B7280]">This takes about 10 seconds</p>
      </div>
      <div className="space-y-2">
        {STEP_DEFS.map((step, i) => (
          <StepRow key={step.label} label={step.label} detail={step.detail} status={statuses[i]} />
        ))}
      </div>
    </div>
  );
}
