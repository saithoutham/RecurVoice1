"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { sentenceForToday } from "@/lib/demo";
import { normalizeRecordedBlob } from "@/lib/audio";
import { SESSION_KEYS, storeBlob } from "@/lib/session";

function supportedMimeType() {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/wav")) {
    return "audio/wav";
  }
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "";
}

export default function ReadingPage() {
  const router = useRouter();
  const sentence = sentenceForToday();
  const [recording, setRecording] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [samples, setSamples] = useState<number[]>([]);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const voiceStartedRef = useRef(false);
  const lastVoiceRef = useRef(0);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  function cleanup() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
  }

  async function startRecording() {
    cleanup();
    setError("");
    setCompleted(false);
    setRecording(true);
    setSamples([]);
    voiceStartedRef.current = false;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext({ sampleRate: 16000 });
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      const recorder = new MediaRecorder(
        stream,
        supportedMimeType() ? { mimeType: supportedMimeType() } : undefined
      );
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.start();

      streamRef.current = stream;
      recorderRef.current = recorder;
      audioContextRef.current = context;
      analyserRef.current = analyser;
      lastVoiceRef.current = performance.now();

      const draw = () => {
        if (!analyserRef.current) return;
        const waveform = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(waveform);
        const compressed = Array.from({ length: 48 }, (_, bucket) => {
          const start = Math.floor((bucket / 48) * waveform.length);
          const end = Math.floor(((bucket + 1) / 48) * waveform.length);
          let peak = 0;
          for (let index = start; index < end; index += 1) {
            peak = Math.max(peak, Math.abs(waveform[index]));
          }
          return peak;
        });
        setSamples(compressed);
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();

      intervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        const frame = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(frame);
        let sum = 0;
        for (let index = 0; index < frame.length; index += 1) {
          sum += frame[index] * frame[index];
        }
        const rms = Math.sqrt(sum / frame.length);
        if (rms > 0.02) {
          voiceStartedRef.current = true;
          lastVoiceRef.current = performance.now();
        }

        if (
          voiceStartedRef.current &&
          performance.now() - lastVoiceRef.current >= 1500
        ) {
          void stopRecording();
        }
      }, 100);
    } catch {
      setRecording(false);
      setError("Recording failed. Please try again.");
    }
  }

  async function stopRecording() {
    if (!recorderRef.current) return;
    const recorder = recorderRef.current;
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    const blob = new Blob(chunksRef.current, {
      type: recorder.mimeType || supportedMimeType() || "audio/webm"
    });
    const normalized = await normalizeRecordedBlob(blob);
    await storeBlob(SESSION_KEYS.readingBlob, normalized);
    cleanup();
    setRecording(false);
    setCompleted(true);
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[36px] border border-moss/10 bg-white px-8 py-10 shadow-panel">
      <h1 className="text-center font-[var(--font-display)] text-5xl text-ink">
        Now read this out loud
      </h1>
      <div
        className={`mt-8 rounded-[32px] border px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${
          completed
            ? "border-green-200 bg-green-50 text-green-900"
            : "border-moss/10 bg-[#FBF8F1]"
        }`}
      >
        <p className="mx-auto max-w-2xl text-[26px] leading-[1.5]">
          {sentence}
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <WaveformVisualizer samples={samples} />
      </div>

      {error ? <p className="mt-5 text-center text-base text-wine">{error}</p> : null}

      <div className="mt-8 flex flex-col items-center gap-4">
        {!completed ? (
          <button
            type="button"
            onClick={() => void startRecording()}
            className="flex min-h-16 min-w-[220px] items-center justify-center rounded-full bg-moss px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
          >
            {recording ? "Recording..." : "Tap to record"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/demo/illness")}
            className="flex min-h-16 min-w-[220px] items-center justify-center rounded-full bg-moss px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
