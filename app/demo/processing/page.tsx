"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { analyzeSession, registerSessionPatient } from "@/lib/api";
import {
  concatenateBuffers,
  createAudioContext,
  decodeBlobToAudioBuffer,
  extractFeaturePayload,
  resampleAudioBuffer,
  voiceActivityDetect
} from "@/lib/audio";
import {
  SESSION_KEYS,
  getIllnessFlag,
  getSessionId,
  readBlob,
  setJson
} from "@/lib/session";
import { persistLocalDashboardRecording } from "@/lib/dashboard-store";

const steps = [
  {
    title: "Loading your recordings...",
    detail: "Decoding the vowel and reading samples into a single browser audio buffer."
  },
  {
    title: "Isolating voiced frames...",
    detail: "Removing silence so only the voiced parts of your recording remain."
  },
  {
    title: "Extracting acoustic features...",
    detail: "Reading pitch, resonance, and spectral shape frame by frame."
  },
  {
    title: "Calculating HNR and jitter...",
    detail: "Estimating harmonic quality and cycle-to-cycle stability."
  },
  {
    title: "Sending to analysis engine...",
    detail: "Sending only numeric features to the RecurVoice API."
  },
  {
    title: "Reading your results...",
    detail: "Turning the model response into a simple status card."
  }
] as const;

export default function ProcessingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    void run();
  }, []);

  async function run() {
    let context: AudioContext | null = null;
    try {
      setStepIndex(0);
      const vowelBlob = readBlob(SESSION_KEYS.vowelBlob);
      const readingBlob = readBlob(SESSION_KEYS.readingBlob);
      const sessionId = getSessionId();

      if (!vowelBlob || !readingBlob || !sessionId) {
        throw new Error("We could not find your recordings. Please start again.");
      }

      context = createAudioContext();
      const vowelBuffer = await decodeBlobToAudioBuffer(vowelBlob, context);
      const readingBuffer = await decodeBlobToAudioBuffer(readingBlob, context);
      const vowelResampled = await resampleAudioBuffer(vowelBuffer, 16000);
      const readingResampled = await resampleAudioBuffer(readingBuffer, 16000);
      const joined = concatenateBuffers(vowelResampled, readingResampled, context);

      setStepIndex(1);
      const vad = voiceActivityDetect(joined.getChannelData(0), 16000, 0.01);
      if (vad.durationSeconds < 1.5) {
        throw new Error("We could not detect enough voice. Please go back and try again.");
      }

      setStepIndex(2);
      const features = await extractFeaturePayload(joined);
      setJson(SESSION_KEYS.features, features);

      setStepIndex(3);
      await new Promise((resolve) => window.setTimeout(resolve, 450));

      setStepIndex(4);
      const analyzedAt = new Date().toISOString();
      await registerSessionPatient(sessionId);
      const result = await analyzeSession(sessionId, getIllnessFlag(), features, analyzedAt);
      setJson(SESSION_KEYS.result, result);
      persistLocalDashboardRecording(sessionId, analyzedAt, features, result);

      setStepIndex(5);
      window.setTimeout(() => router.push("/demo/result"), 400);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again."
      );
    } finally {
      if (context && context.state !== "closed") {
        await context.close();
      }
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-[34px] border border-red-200 bg-white p-8 shadow-panel">
        <h1 className="font-[var(--font-display)] text-4xl text-ink">We hit a problem</h1>
        <p className="mt-4 text-lg leading-8 text-moss/70">{error}</p>
        <Link
          href="/demo/vowel"
          className="mt-8 inline-flex min-h-16 items-center justify-center rounded-full bg-moss px-8 py-4 text-lg font-semibold text-white"
        >
          Go back
        </Link>
      </div>
    );
  }

  const currentStep = steps[stepIndex];

  return (
    <div className="mx-auto max-w-lg rounded-[36px] border border-moss/10 bg-white p-10 text-center shadow-panel">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sage border-t-moss" />
      <h1 className="mt-8 font-[var(--font-display)] text-5xl text-ink">
        {currentStep.title}
      </h1>
      <p className="mt-4 text-sm uppercase tracking-[0.24em] text-moss/40">
        Step {stepIndex + 1} of {steps.length}
      </p>
      <p className="mt-6 text-sm leading-7 text-moss/58">{currentStep.detail}</p>
      <div className="mt-8 space-y-3 text-left">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`rounded-2xl border px-4 py-3 text-sm ${
              index === stepIndex
                ? "border-moss/20 bg-sage/60 text-moss"
                : index < stepIndex
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-black/5 bg-[#FBF9F4] text-moss/45"
            }`}
          >
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );
}
