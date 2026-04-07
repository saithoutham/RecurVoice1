"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  samples?: number[];
  audioUrl?: string | null;
};

// Draw decoded PCM samples onto a canvas
function drawWaveform(canvas: HTMLCanvasElement, pcm: Float32Array) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const barCount = 80;
  const barWidth = 3;
  const gap = Math.max(1, (width - barCount * barWidth) / (barCount - 1));
  const mid = height / 2;

  ctx.fillStyle = "#1B4332";
  ctx.globalAlpha = 0.85;

  for (let i = 0; i < barCount; i++) {
    const start = Math.floor((i / barCount) * pcm.length);
    const end = Math.floor(((i + 1) / barCount) * pcm.length);
    let peak = 0;
    for (let j = start; j < end; j++) peak = Math.max(peak, Math.abs(pcm[j]));
    const barH = Math.max(3, peak * mid * 1.6);
    const x = i * (barWidth + gap);
    const radius = barWidth / 2;
    ctx.beginPath();
    ctx.roundRect(x, mid - barH, barWidth, barH * 2, radius);
    ctx.fill();
  }
}

export function WaveformVisualizer({ samples = [], audioUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Decode audio and draw waveform when audioUrl changes
  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;
    setLoaded(false);

    const canvas = canvasRef.current;
    const ac = new AudioContext();

    fetch(audioUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => ac.decodeAudioData(buf))
      .then((decoded) => {
        const pcm = decoded.getChannelData(0);
        drawWaveform(canvas, pcm);
        setLoaded(true);
      })
      .catch(() => {
        // Draw a flat placeholder on error
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#D1D5DB";
          ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
        }
        setLoaded(true);
      })
      .finally(() => ac.close());
  }, [audioUrl]);

  // Playback state sync
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => setIsPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  if (audioUrl) {
    return (
      <div className="w-full space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-5">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1B4332]" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="h-20 w-full"
            style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
          />
        </div>
        <audio ref={audioRef} src={audioUrl} preload="auto" className="hidden" />
        <button
          type="button"
          onClick={() => {
            const el = audioRef.current;
            if (!el) return;
            if (isPlaying) { el.pause(); } else { void el.play(); }
          }}
          className="flex items-center gap-2 rounded-full bg-[#1B4332] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14532D]"
        >
          <span>{isPlaying ? "⏸" : "▶"}</span>
          {isPlaying ? "Pause" : "Play recording"}
        </button>
      </div>
    );
  }

  // Live waveform bars (during recording)
  const bars = samples.length
    ? samples.slice(-48)
    : Array.from({ length: 48 }, (_, i) => 0.08 + ((i % 5) / 20));

  return (
    <div className="flex h-20 w-full items-center justify-center gap-[3px] rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4">
      {bars.map((value, index) => (
        <span
          key={index}
          className="w-[3px] rounded-full bg-[#1B4332]/70 transition-all duration-75"
          style={{ height: `${Math.max(4, value * 64)}px` }}
        />
      ))}
    </div>
  );
}
