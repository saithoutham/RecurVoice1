"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ProgressRing } from "@/components/ProgressRing";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { normalizeRecordedBlob } from "@/lib/audio";
import { SESSION_KEYS, storeBlob } from "@/lib/session";

type Stage = "idle" | "listening" | "recording" | "complete" | "error";

function supportedMimeType() {
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/wav")) {
    return "audio/wav";
  }
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "";
}

export default function VowelPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [dbLevel, setDbLevel] = useState(0);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const hasCompletedRef = useRef(false);
  const stageRef = useRef<Stage>("idle");

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
    recorderRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  }

  function updateStage(next: Stage) {
    stageRef.current = next;
    setStage(next);
  }

  async function startCapture() {
    cleanup();
    setError("");
    setShake(false);
    updateStage("listening");
    setProgress(0);
    setSamples([]);
    chunksRef.current = [];
    hasCompletedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = supportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.start();

      streamRef.current = stream;
      recorderRef.current = recorder;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      let consecutiveVoiceFrames = 0;
      const listeningStarted = performance.now();
      const drawWaveform = () => {
        if (!analyserRef.current) return;
        const analyserNode = analyserRef.current;
        const waveform = new Float32Array(analyserNode.fftSize);
        analyserNode.getFloatTimeDomainData(waveform);
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
        animationRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

      intervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        const analyserNode = analyserRef.current;
        const frame = new Float32Array(analyserNode.fftSize);
        analyserNode.getFloatTimeDomainData(frame);
        let sum = 0;
        for (let index = 0; index < frame.length; index += 1) {
          sum += frame[index] * frame[index];
        }
        const rms = Math.sqrt(sum / frame.length);
        const db = Math.max(0, 20 * Math.log10(rms + 1e-6) + 100);
        setDbLevel(db);

        if (rms > 0.02) {
          consecutiveVoiceFrames += 1;
        } else {
          consecutiveVoiceFrames = 0;
        }

        if (consecutiveVoiceFrames >= 3 && stageRef.current !== "recording") {
          updateStage("recording");
          const startedAt = performance.now();
          const fill = () => {
            const elapsed = performance.now() - startedAt;
            const next = Math.min(1, elapsed / 5000);
            setProgress(next);
            if (next >= 1 && !hasCompletedRef.current) {
              hasCompletedRef.current = true;
              void stopCapture();
              return;
            }
            animationRef.current = requestAnimationFrame(fill);
          };
          fill();
        }

        if (performance.now() - listeningStarted > 5000 && stageRef.current === "listening") {
          cleanup();
          updateStage("error");
          setError("We didn't hear anything - tap to try again");
          setShake(true);
          window.setTimeout(() => setShake(false), 500);
        }
      }, 100);
    } catch {
      updateStage("error");
      setError("Recording failed. Please try again.");
    }
  }

  async function stopCapture() {
    if (!recorderRef.current) return;
    const recorder = recorderRef.current;
    try {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || supportedMimeType() || "audio/webm"
      });
      const normalized = await normalizeRecordedBlob(blob);
      await storeBlob(SESSION_KEYS.vowelBlob, normalized);
      cleanup();
      updateStage("complete");
      setProgress(1);
      window.setTimeout(() => router.push("/demo/reading"), 1000);
    } catch {
      cleanup();
      updateStage("error");
      setError("We could not save that recording. Please try again.");
    }
  }

  return (
    <div className={`mx-auto flex max-w-xl flex-col items-center rounded-[36px] border border-moss/10 bg-white px-8 py-10 shadow-panel ${shake ? "animate-[wiggle_0.35s_ease-in-out]" : ""}`}>
      <style>{`@keyframes wiggle { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }`}</style>
      <h1 className="font-[var(--font-display)] text-center text-5xl text-ink">
        Take a deep breath
      </h1>
      <p className="mt-3 text-center text-lg text-moss/65">
        Then say AHHHH until the ring fills
      </p>

      <div className="mt-10">
        <ProgressRing
          progress={progress}
          label={stage === "complete" ? "Done" : "AHHHH"}
          status={stage === "error" ? "error" : stage === "complete" ? "complete" : stage === "recording" ? "recording" : "idle"}
        />
      </div>

      <div className="mt-8">
        <WaveformVisualizer samples={samples} />
      </div>

      <div className="mt-4 h-2 w-full max-w-[300px] overflow-hidden rounded-full bg-sage/80">
        <div
          className="h-full rounded-full bg-moss transition-all"
          style={{ width: `${Math.max(8, Math.min(100, (dbLevel / 80) * 100))}%` }}
        />
      </div>

      {error ? <p className="mt-5 text-base text-wine">{error}</p> : null}

      <button
        type="button"
        onClick={() => void startCapture()}
        className="mt-8 flex min-h-16 items-center justify-center rounded-full border border-moss/10 bg-moss px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
      >
        {stage === "idle" || stage === "error" ? "Tap to begin" : stage === "listening" ? "Listening..." : stage === "recording" ? "Recording..." : "Captured"}
      </button>
    </div>
  );
}
