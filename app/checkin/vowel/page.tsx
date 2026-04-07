"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ProgressRing } from "@/components/ProgressRing";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { normalizeRecordedBlob } from "@/lib/audio";
import { CHECKIN_KEYS, storeCheckinBlob } from "@/lib/checkin-session";

type Stage = "idle" | "listening" | "recording" | "complete" | "error";

function supportedMimeType() {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/wav")) return "audio/wav";
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}

export default function CheckinVowelPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [dbLevel, setDbLevel] = useState(0);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(false);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
  }

  async function startCapture() {
    cleanup();
    chunksRef.current = [];
    startedRef.current = false;
    setError("");
    setStage("listening");
    setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext({ sampleRate: 16000 });
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const recorder = new MediaRecorder(stream, supportedMimeType() ? { mimeType: supportedMimeType() } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.start();

      streamRef.current = stream;
      recorderRef.current = recorder;
      audioContextRef.current = context;
      analyserRef.current = analyser;

      const draw = () => {
        if (!analyserRef.current) return;
        const waveform = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(waveform);
        const compressed = Array.from({ length: 48 }, (_, bucket) => {
          const start = Math.floor((bucket / 48) * waveform.length);
          const end = Math.floor(((bucket + 1) / 48) * waveform.length);
          let peak = 0;
          for (let index = start; index < end; index += 1) peak = Math.max(peak, Math.abs(waveform[index]));
          return peak;
        });
        setSamples(compressed);
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();

      let voiceFrames = 0;
      const listeningStarted = performance.now();
      intervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        const frame = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(frame);
        let sum = 0;
        for (let index = 0; index < frame.length; index += 1) sum += frame[index] * frame[index];
        const rms = Math.sqrt(sum / frame.length);
        const db = Math.max(0, 20 * Math.log10(rms + 1e-6) + 100);
        setDbLevel(db);

        if (rms > 0.02) voiceFrames += 1; else voiceFrames = 0;
        if (voiceFrames >= 3 && !startedRef.current) {
          startedRef.current = true;
          setStage("recording");
          const startedAt = performance.now();
          const fill = () => {
            const next = Math.min(1, (performance.now() - startedAt) / 5000);
            setProgress(next);
            if (next >= 1) {
              void stopCapture();
              return;
            }
            animationRef.current = requestAnimationFrame(fill);
          };
          fill();
        }

        if (performance.now() - listeningStarted > 5000 && !startedRef.current) {
          cleanup();
          setStage("error");
          setError("We didn't hear anything. Tap to try again.");
        }
      }, 100);
    } catch {
      setStage("error");
      setError("Recording failed. Please try again.");
    }
  }

  async function stopCapture() {
    if (!recorderRef.current) return;
    await new Promise<void>((resolve) => {
      recorderRef.current!.onstop = () => resolve();
      recorderRef.current!.stop();
    });
    const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType || supportedMimeType() || "audio/webm" });
    const normalized = await normalizeRecordedBlob(blob);
    await storeCheckinBlob(CHECKIN_KEYS.vowelBlob, normalized);
    cleanup();
    setStage("complete");
    window.setTimeout(() => router.push("/checkin/reading"), 800);
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-8 py-10 text-center">
      <h1 className="text-4xl font-semibold">Take a deep breath</h1>
      <p className="mt-3 text-lg text-[#4B5563]">Then say AHHHH until the ring fills</p>
      <div className="mt-10 flex justify-center">
        <ProgressRing progress={progress} label={stage === "complete" ? "Done" : "AHHHH"} status={stage === "error" ? "error" : stage === "complete" ? "complete" : stage === "recording" ? "recording" : "idle"} />
      </div>
      <div className="mt-8 flex justify-center">
        <WaveformVisualizer samples={samples} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div className="h-full rounded-full bg-[#1B4332]" style={{ width: `${Math.max(8, Math.min(100, (dbLevel / 80) * 100))}%` }} />
      </div>
      {error ? <p className="mt-5 text-base text-[#991B1B]">{error}</p> : null}
      <button type="button" onClick={() => void startCapture()} className="mt-8 flex min-h-16 w-full items-center justify-center rounded-xl bg-[#1B4332] px-8 py-4 text-lg font-semibold text-white">
        {stage === "idle" || stage === "error" ? "Tap to begin" : stage === "complete" ? "Captured" : "Listening..."}
      </button>
    </div>
  );
}
