"use client";

type ProgressRingProps = {
  progress: number;
  label: string;
  status?: "idle" | "recording" | "complete" | "error";
  size?: number;
};

export function ProgressRing({
  progress,
  label,
  status = "idle",
  size = 200
}: ProgressRingProps) {
  const stroke = 12;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const strokeColor =
    status === "complete" ? "#1B4332" : status === "error" ? "#B45309" : "#1B4332";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="drop-shadow-[0_20px_50px_rgba(27,67,50,0.18)]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 10}
          fill="rgba(200,169,106,0.18)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="white"
          stroke="rgba(18,33,23,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-full">
        <span className="font-sans text-sm uppercase tracking-[0.32em] text-moss/55">
          Live
        </span>
        <span className="mt-2 text-4xl font-semibold tracking-[0.28em] text-moss">
          {status === "complete" ? "Done" : label}
        </span>
      </div>
    </div>
  );
}
