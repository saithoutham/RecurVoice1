"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { normalizeRecordedBlob } from "@/lib/audio";
import { CHECKIN_KEYS, storeCheckinBlob } from "@/lib/checkin-session";
import { sentenceForToday } from "@/lib/demo";

function supportedMimeType() {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/wav")) return "audio/wav";
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}

export default function CheckinReadingPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [samples, setSamples] = useState<number[]>([]);
  const [error, setError] = useState("");
  const sentence = sentenceForToday();

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const voiceStartedRef = useRef(false);
  const lastVoiceRef = useRef(0);

  useEffect(() => () => cleanup(), []);

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
    setRecording(true);
    setCompleted(false);
    setError("");
    chunksRef.current = [];
    voiceStartedRef.current = false;
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
      lastVoiceRef.current = performance.now();

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

      intervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        const frame = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(frame);
        let sum = 0;
        for (let index = 0; index < frame.length; index += 1) sum += frame[index] * frame[index];
        const rms = Math.sqrt(sum / frame.length);
        if (rms > 0.02) {
          voiceStartedRef.current = true;
          lastVoiceRef.current = performance.now();
        }
        if (voiceStartedRef.current && performance.now() - lastVoiceRef.current > 1500) {
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
    await new Promise<void>((resolve) => {
      recorderRef.current!.onstop = () => resolve();
      recorderRef.current!.stop();
    });
    const blob = new Blob(chunksRef.current, { type: recorderRef.current.mimeType || supportedMimeType() || "audio/webm" });
    const normalized = await normalizeRecordedBlob(blob);
    await storeCheckinBlob(CHECKIN_KEYS.readingBlob, normalized);
    cleanup();
    setRecording(false);
    setCompleted(true);
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-8 py-10">
      <h1 className="text-center text-4xl font-semibold">Now read this out loud</h1>
      <div className={`mt-8 rounded-xl border px-8 py-12 text-center ${completed ? "border-green-200 bg-green-50 text-green-900" : "border-[#E5E7EB] bg-[#F9FAFB]"}`}>
        <p className="text-[26px] leading-[1.5]">{sentence}</p>
      </div>
      <div className="mt-8 flex justify-center">
        <WaveformVisualizer samples={samples} />
      </div>
      {error ? <p className="mt-5 text-center text-base text-[#991B1B]">{error}</p> : null}
      <div className="mt-8">
        {!completed ? (
          <button type="button" onClick={() => void startRecording()} className="flex min-h-16 w-full items-center justify-center rounded-xl bg-[#1B4332] px-8 py-4 text-lg font-semibold text-white">
            {recording ? "Recording..." : "Tap to record"}
          </button>
        ) : (
          <button type="button" onClick={() => router.push("/checkin/cough")} className="flex min-h-16 w-full items-center justify-center rounded-xl bg-[#1B4332] px-8 py-4 text-lg font-semibold text-white">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
