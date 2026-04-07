"use client";

type AmbientMeterProps = {
  value: number;
};

export function AmbientMeter({ value }: AmbientMeterProps) {
  const normalized = Math.max(0, Math.min(100, (value / 60) * 100));

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.24em] text-moss/50">
        <span>Ambient level</span>
        <span>{value.toFixed(1)} dB</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-sage/70">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            value < 45 ? "bg-moss" : "bg-wine"
          }`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
