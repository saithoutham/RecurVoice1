"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { normalizeRecordedBlob } from "@/lib/audio";
import { CHECKIN_KEYS, storeCheckinBlob } from "@/lib/checkin-session";

type Stage = "idle" | "recording" | "complete" | "error";

function supportedMimeType() {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/wav")) return "audio/wav";
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}

export default function CheckinCoughPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
  }

  async function startRecording() {
    cleanup();
    chunksRef.current = [];
    setError("");
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext({ sampleRate: 16000 });
      const recorder = new MediaRecorder(stream, supportedMimeType() ? { mimeType: supportedMimeType() } : undefined);
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.start();
      streamRef.current = stream;
      recorderRef.current = recorder;
      audioContextRef.current = context;
      startTimeRef.current = Date.now();
      setStage("recording");

      timerRef.current = window.setInterval(() => {
        const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(sec);
        // Auto-stop at 30 seconds
        if (sec >= 30) void stopRecording();
      }, 500);
    } catch {
      setStage("error");
      setError("Could not access microphone. Please try again.");
    }
  }

  async function stopRecording() {
    if (!recorderRef.current || stage === "complete") return;
    cleanup();
    await new Promise<void>((resolve) => {
      recorderRef.current!.onstop = () => resolve();
      if (recorderRef.current!.state !== "inactive") recorderRef.current!.stop();
      else resolve();
    });
    const blob = new Blob(chunksRef.current, {
      type: recorderRef.current.mimeType || supportedMimeType() || "audio/webm"
    });
    const normalized = await normalizeRecordedBlob(blob);
    await storeCheckinBlob(CHECKIN_KEYS.coughBlob, normalized);
    setStage("complete");
  }

  const MAX_SEC = 30;
  const ringProgress = stage === "recording" ? Math.min(elapsed / MAX_SEC, 1) : stage === "complete" ? 1 : 0;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-10 text-center shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Cough recording</h1>
      <p className="mt-3 text-base leading-7 text-[#4B5563]">
        Tap record, then cough naturally 4 times. Tap stop when finished.
      </p>

      {/* Circular timer */}
      <div className="mt-10 flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={stage === "complete" ? "#15803D" : "#1B4332"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ringProgress)}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {stage === "complete" ? (
              <span className="text-4xl text-green-600">✓</span>
            ) : stage === "recording" ? (
              <>
                <span className="text-3xl font-bold tabular-nums text-[#1B4332]">{elapsed}s</span>
                <span className="text-xs text-[#6B7280]">of 30s</span>
              </>
            ) : (
              <span className="text-4xl">🫁</span>
            )}
          </div>
        </div>

        {/* Cough count guide */}
        <div className="mt-6 flex gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                stage === "complete"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : stage === "recording" && elapsed >= (n - 1) * 4
                  ? "border-[#1B4332] bg-[#F0FDF4] text-[#1B4332]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]"
              }`}
            >
              {n}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#9CA3AF]">Cough count guide</p>
      </div>

      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 space-y-3">
        {stage === "idle" || stage === "error" ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1B4332] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#14532D]"
          >
            <span className="text-xl">●</span> Start recording
          </button>
        ) : stage === "recording" ? (
          <button
            type="button"
            onClick={() => void stopRecording()}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-700"
          >
            <span className="text-xl">■</span> Stop recording
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/checkin/illness")}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#14532D]"
          >
            Continue →
          </button>
        )}

        {stage === "idle" || stage === "error" ? null : stage === "complete" ? (
          <button
            type="button"
            onClick={() => { setStage("idle"); setElapsed(0); }}
            className="w-full rounded-xl border border-[#E5E7EB] py-3 text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB]"
          >
            Re-record
          </button>
        ) : null}
      </div>
    </div>
  );
}
