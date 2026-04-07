"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type AlertRow = {
  id: string;
  level: string;
  filter_value: string;
  message: string;
  caregiver_notified: boolean;
  acknowledged: boolean;
  triggered_at: string;
};

function levelChip(value: string) {
  if (value === "URGENT" || value === "Level 3") {
    return "bg-red-100 text-red-800";
  }
  if (value === "EARLY_WARNING" || value === "Level 2") {
    return "bg-orange-100 text-orange-800";
  }
  if (value === "WATCH" || value === "Level 1") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-green-100 text-green-800";
}

export function AlertsTable({
  alerts,
  kind
}: {
  alerts: AlertRow[];
  kind: "voice" | "convergence";
}) {
  const [filter, setFilter] = useState<string>("all");
  const rows = useMemo(
    () => alerts.filter((alert) => filter === "all" || alert.filter_value === filter),
    [alerts, filter]
  );
  const filterOptions = ["all", ...Array.from(new Set(alerts.map((alert) => alert.filter_value)))];

  async function acknowledge(alertId?: string) {
    await fetch("/api/alerts/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, kind })
    });
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-4 py-2 text-base font-semibold ${
              filter === option ? "border-[#1B4332] bg-[#1B4332] text-white" : "border-[#E5E7EB] bg-white text-[#0A0A0A]"
            }`}
          >
            {option === "all" ? "All alerts" : option}
          </button>
        ))}
      </div>
      {!rows.length ? (
        <p className="text-lg leading-8 text-[#4B5563]">No alerts yet. This is a good sign.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
          <table className="min-w-full text-left">
            <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-sm uppercase tracking-[0.18em] text-[#6B7280]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Caregiver notified</th>
                <th className="px-4 py-3">Acknowledged</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((alert) => (
                <tr key={alert.id} className="border-b border-[#E5E7EB] align-top text-lg">
                  <td className="px-4 py-4">{new Date(alert.triggered_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-2 text-sm font-semibold ${levelChip(alert.level)}`}>
                      {alert.level}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#4B5563]">{alert.message}</td>
                  <td className="px-4 py-4">{alert.caregiver_notified ? "Yes" : "No"}</td>
                  <td className="px-4 py-4">
                    {alert.acknowledged ? "Yes" : <Button size="sm" onClick={() => void acknowledge(alert.id)}>Acknowledge</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!alerts.length ? (
        <Button variant="outline" onClick={() => void acknowledge()}>
          Mark all alerts acknowledged
        </Button>
      ) : null}
    </div>
  );
}
