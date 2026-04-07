import Link from "next/link";

import { AlertLevelBadge } from "@/components/AlertLevelBadge";
import { BaselineCalendar } from "@/components/BaselineCalendar";
import { PageIntro } from "@/components/PageIntro";
import { MetricTrendChart } from "@/components/charts/MetricTrendChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { alertTitle, hnrSeries } from "@/lib/metrics";
import { convergenceStatusMessage, proScoreTone } from "@/lib/clinical";
import { CALIBRATION_DAYS } from "@/lib/config";
import { formatDate, formatMetricNumber, formatTime } from "@/lib/utils";

function convergenceTone(level: number) {
  if (level >= 3) return "border-red-200 bg-red-50 text-red-900";
  if (level === 2) return "border-orange-200 bg-orange-50 text-orange-900";
  if (level === 1) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-green-200 bg-green-50 text-green-900";
}

function DashboardMetricCard({
  label,
  value,
  unit,
  style
}: {
  label: string;
  value: number;
  unit?: string;
  style: "hnr" | "percent" | "score";
}) {
  const formatted = formatMetricNumber(value, style);
  const sizeClass =
    formatted.length >= 6
      ? "text-[1.45rem] sm:text-[1.7rem] xl:text-[1.95rem]"
      : formatted.length >= 5
        ? "text-[1.6rem] sm:text-[1.85rem] xl:text-[2.1rem]"
        : "text-[1.9rem] sm:text-[2.15rem] xl:text-[2.45rem]";

  return (
    <Card className="min-w-0 rounded-[22px] border-[#E5E7EB] bg-[#F9FAFB] shadow-sm">
      <CardContent className="min-w-0 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[#6B7280]">{label}</p>
        <div className="mt-3 min-w-0 overflow-hidden">
          <p
            className={`${sizeClass} whitespace-nowrap font-semibold leading-none tracking-[-0.06em] text-[#0A0A0A] tabular-nums`}
          >
            {formatted}
          </p>
          {unit ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#6B7280]">
              {unit}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatRow({
  label,
  value,
  mono = false
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="shrink-0 text-sm text-[#4B5563]">{label}</span>
      <div
        className={`text-right text-sm font-semibold text-[#0A0A0A] ${
          mono ? "font-mono tabular-nums tracking-tight" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const summary = await getCurrentDashboardSummary();

  const baselineDays = Math.min(summary.daysMonitored, CALIBRATION_DAYS);
  const recentHnr = hnrSeries(summary.recentSessions.slice(-14));
  const convergenceLevel = summary.latestConvergenceAlert?.convergence_level ?? 0;
  const latestProTone = proScoreTone(summary.latestProAssessment?.composite_pro_score ?? 0);

  return (
    <main className="bg-[#F9FAFB] px-4 py-8">
      <div className="mx-auto max-w-[1160px] space-y-6">
        <PageIntro
          eyebrow="Dashboard"
          title="Your monitoring overview"
          body="Everything you need for today's check-in and the latest picture of your voice trend."
        />

        {summary.unacknowledgedConvergenceAlerts[0] || summary.unacknowledgedAlerts[0] ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Alert
                </p>
                <p className="mt-2 text-lg font-semibold text-orange-900 md:text-xl">
                  {summary.unacknowledgedConvergenceAlerts[0]
                    ? convergenceStatusMessage(
                        summary.unacknowledgedConvergenceAlerts[0].convergence_level
                      )
                    : summary.unacknowledgedAlerts[0]?.message}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/alerts">Review alerts</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {summary.frequencyNotice ? (
          <Card className="border-[#D9F99D] bg-[#F7FEE7]">
            <CardContent className="p-5 text-base leading-7 text-[#3F6212]">
              {summary.frequencyNotice}
            </CardContent>
          </Card>
        ) : null}

        <div className={`rounded-xl border p-5 ${convergenceTone(convergenceLevel)}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">Combined status</p>
          <p className="mt-3 text-xl font-semibold md:text-2xl">
            {convergenceStatusMessage(convergenceLevel)}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl leading-tight md:text-[2.75rem]">
                        {summary.checkedInToday
                          ? alertTitle(summary.latestSession?.alert_level ?? null)
                          : "Your daily voice check-in is ready"}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base leading-7">
                        {summary.checkedInToday
                          ? summary.latestSession?.ai_interpretation ??
                            summary.latestSession?.alert_level ??
                            "Today's voice result is ready."
                          : "You have not completed today's voice check-in yet."}
                      </CardDescription>
                    </div>
                    <AlertLevelBadge level={summary.latestSession?.alert_level ?? null} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {summary.checkedInToday && summary.latestSession ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <DashboardMetricCard
                        label="HNR"
                        value={summary.latestSession.hnr_mean ?? 0}
                        unit="dB"
                        style="hnr"
                      />
                      <DashboardMetricCard
                        label="Jitter"
                        value={(summary.latestSession.jitter_local ?? 0) * 100}
                        unit="percent"
                        style="percent"
                      />
                      <DashboardMetricCard
                        label="CUSUM"
                        value={summary.latestSession.cusum_score ?? 0}
                        style="score"
                      />
                    </div>
                  ) : null}
                  <Button asChild className="w-full md:w-auto">
                    <Link href="/checkin">
                      {summary.checkedInToday ? "Repeat today's check-in" : "Start check-in"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl leading-tight">Weekly symptom check-in</CardTitle>
                      <CardDescription className="mt-2 text-base leading-7">
                        {summary.latestProAssessment
                          ? `Last completed ${formatDate(summary.latestProAssessment.assessed_at)} at ${formatTime(summary.latestProAssessment.assessed_at)}`
                          : "You have not completed a weekly symptom check-in yet."}
                      </CardDescription>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${latestProTone.chip}`}>
                      {summary.latestProAssessment
                        ? summary.latestProAssessment.composite_pro_score.toFixed(0)
                        : "Due"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-base leading-7 text-[#4B5563]">
                    {summary.latestProAssessment
                      ? `Your most recent weekly symptom score looks ${latestProTone.label.toLowerCase()}.`
                      : "This short weekly check-in helps RecurVoice compare your voice changes with how you felt this week."}
                  </p>
                  <Button asChild className="w-full md:w-auto">
                    <Link href="/weekly-checkin">
                      {summary.weeklyCheckinDue ? "Complete this week's check-in" : "Review weekly check-in"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {!summary.baseline?.calibration_complete ? (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">14-day baseline progress</CardTitle>
                  <CardDescription className="mt-2 text-base leading-7">
                    Day {baselineDays} of {CALIBRATION_DAYS} complete. Keep going.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BaselineCalendar completedDays={baselineDays} />
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Recent HNR trend</CardTitle>
                    <CardDescription className="mt-2 text-base leading-7">The last 14 days of voice clarity scores.</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/trends">View full trends</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentHnr.length >= 3 ? (
                  <MetricTrendChart
                    data={recentHnr}
                    lines={{ color: "#1B4332", label: "HNR" }}
                    bands={[
                      { from: 15, to: 30, fill: "#DCFCE7" },
                      { from: 10, to: 15, fill: "#FEF3C7" },
                      { from: 0, to: 10, fill: "#FEE2E2" }
                    ]}
                    yDomain={[0, 25]}
                  />
                ) : (
                  <p className="text-base leading-7 text-[#4B5563]">More data is needed before we can show your trend.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Quick stats</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-[#F3F4F6] text-[#4B5563]">
                <QuickStatRow label="Days monitored" value={summary.daysMonitored} mono />
                <QuickStatRow
                  label="Current CUSUM score"
                  value={formatMetricNumber(summary.baseline?.current_cusum_score ?? 0, "score")}
                  mono
                />
                <QuickStatRow label="Current PRO frequency" value={summary.currentProFrequency} />
                <QuickStatRow
                  label="Last check-in"
                  value={
                    summary.latestSession ? (
                      <span className="block">
                        <span className="block">{formatDate(summary.latestSession.recorded_at)}</span>
                        <span className="block">{formatTime(summary.latestSession.recorded_at)}</span>
                      </span>
                    ) : (
                      "Not yet"
                    )
                  }
                  mono
                />
                <QuickStatRow label="Streak" value={`${summary.streak} days`} />
                <QuickStatRow label="Next reminder" value={summary.nextReminder} mono />
                <Button asChild variant="outline" className="w-full">
                  <Link href="/weekly-history">View weekly symptom history</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
