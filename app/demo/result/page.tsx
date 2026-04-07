"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AnalyzeResult } from "@/lib/api";
import { ResultCard } from "@/components/ResultCard";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { interpretHnr, interpretJitter, interpretShimmer } from "@/lib/demo";
import { SESSION_KEYS, clearDemoSession, getJson, readBlob } from "@/lib/session";
import { formatMetricNumber } from "@/lib/utils";

function MetricCard({
  title,
  value,
  suffix,
  interpretation
}: {
  title: string;
  value: number;
  suffix: string;
  interpretation: { label: string; tone: string };
}) {
  const formatted = formatMetricNumber(value, title === "HNR" ? "hnr" : "percent");
  const sizeClass =
    formatted.length >= 6
      ? "text-[1.45rem] sm:text-[1.7rem] xl:text-[1.95rem]"
      : formatted.length >= 5
        ? "text-[1.6rem] sm:text-[1.85rem] xl:text-[2.1rem]"
        : "text-[1.7rem] sm:text-[2rem] xl:text-[2.4rem]";

  return (
    <div className="rounded-[24px] border border-moss/10 bg-white p-4 shadow-panel">
      <p className="text-xs uppercase tracking-[0.24em] text-moss/45">{title}</p>
      <p
        className={`${sizeClass} mt-3 whitespace-nowrap font-semibold leading-none tracking-[-0.06em] text-ink tabular-nums`}
      >
        {formatted}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-moss/45">
        {suffix}
      </p>
      <p className={`mt-3 text-sm font-semibold ${interpretation.tone}`}>
        ▲ {interpretation.label}
      </p>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [features, setFeatures] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setResult(getJson<AnalyzeResult>(SESSION_KEYS.result));
    setFeatures(getJson<Record<string, number>>(SESSION_KEYS.features));
  }, []);

  const vowelUrl = useMemo(() => {
    const blob = readBlob(SESSION_KEYS.vowelBlob);
    return blob ? URL.createObjectURL(blob) : null;
  }, []);

  useEffect(() => {
    return () => {
      if (vowelUrl) URL.revokeObjectURL(vowelUrl);
    };
  }, [vowelUrl]);

  if (!result || !features) {
    return (
      <div className="mx-auto max-w-lg rounded-[34px] border border-moss/10 bg-white p-8 shadow-panel">
        <h1 className="font-[var(--font-display)] text-4xl text-ink">No result yet</h1>
        <p className="mt-4 text-lg leading-8 text-moss/70">
          Complete a full demo session to see your analysis here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ResultCard result={result} />

      <section>
        <h2 className="font-[var(--font-display)] text-3xl text-ink md:text-[2.45rem]">
          Your acoustic features today
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <MetricCard
            title="HNR"
            value={features.hnr_mean ?? 0}
            suffix="dB"
            interpretation={interpretHnr(features.hnr_mean ?? 0)}
          />
          <MetricCard
            title="Jitter"
            value={features.jitter_local ?? 0}
            suffix="%"
            interpretation={interpretJitter(features.jitter_local ?? 0)}
          />
          <MetricCard
            title="Shimmer"
            value={features.shimmer_local ?? 0}
            suffix="%"
            interpretation={interpretShimmer(features.shimmer_local ?? 0)}
          />
        </div>
      </section>

      <section>
        <h2 className="font-[var(--font-display)] text-3xl text-ink md:text-[2.45rem]">Waveform replay</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-moss/70">
          This is your actual sustained vowel sample captured in the browser.
        </p>
        <div className="mt-6">
          <WaveformVisualizer audioUrl={vowelUrl} />
        </div>
      </section>

      <section className="rounded-[28px] border border-black/5 bg-[#F4F4F0] p-6 text-base italic leading-8 text-moss/70">
        RecurVoice tracks these numbers over time. A single session tells us very little. But if your HNR gradually drops over 14 days, that is a signal worth investigating.
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            clearDemoSession();
            router.push("/demo/start");
          }}
          className="flex min-h-16 items-center justify-center rounded-full border border-black/10 bg-white px-8 py-4 text-lg font-semibold text-ink transition hover:border-moss/30 hover:bg-[#F8FBF9]"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex min-h-16 items-center justify-center rounded-full bg-moss px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#143628]"
        >
          See the clinician view
        </button>
      </div>
    </div>
  );
}
