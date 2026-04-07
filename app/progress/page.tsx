import { BaselineCalendar } from "@/components/BaselineCalendar";
import { PageIntro } from "@/components/PageIntro";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { CALIBRATION_DAYS } from "@/lib/config";

function progressMessage(days: number) {
  if (days === 0) return "Complete your first check-in to begin.";
  if (days <= 5) return "Good start. Keep going. Your baseline needs 14 days to be meaningful.";
  if (days <= 13) return "You are almost there. These last days are important.";
  return "Baseline complete. Your personalized monitoring is now active.";
}

export default async function ProgressPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) return null;

  const baselineSessions = summary.recentSessions.slice(0, CALIBRATION_DAYS);
  const baseline = summary.baseline;

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <PageIntro
          eyebrow="Baseline program"
          title="Your 14-day tracker"
          body="This page shows every day of your baseline period and the scores that shape your personal voice reference."
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Baseline calendar</CardTitle>
            <CardDescription>{progressMessage(Math.min(summary.daysMonitored, CALIBRATION_DAYS))}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <BaselineCalendar completedDays={Math.min(summary.daysMonitored, CALIBRATION_DAYS)} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: CALIBRATION_DAYS }, (_, index) => {
                const day = baselineSessions[index];
                return (
                  <Card key={index} className="bg-[#F9FAFB]">
                    <CardContent className="space-y-3 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">Day {index + 1}</p>
                      {day ? (
                        <>
                          <p className="text-base text-[#4B5563]">{new Date(day.recorded_at).toLocaleDateString()}</p>
                          <p className="text-base text-[#0A0A0A]">HNR {day.hnr_mean?.toFixed(1) ?? "-"}</p>
                          <p className="text-base text-[#0A0A0A]">Jitter {((day.jitter_local ?? 0) * 100).toFixed(2)}%</p>
                          <p className="text-base text-[#0A0A0A]">Shimmer {day.shimmer_local?.toFixed(2) ?? "-"}%</p>
                        </>
                      ) : (
                        <p className="text-base text-[#6B7280]">Not completed yet.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {baseline?.calibration_complete ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Your baseline summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card className="bg-[#F9FAFB]"><CardContent className="p-5"><p className="text-sm uppercase tracking-[0.18em] text-[#6B7280]">Baseline HNR</p><p className="mt-2 text-3xl font-semibold">{baseline.baseline_hnr_mean?.toFixed(1) ?? "-"} dB</p></CardContent></Card>
              <Card className="bg-[#F9FAFB]"><CardContent className="p-5"><p className="text-sm uppercase tracking-[0.18em] text-[#6B7280]">Baseline jitter</p><p className="mt-2 text-3xl font-semibold">{(((baseline.baseline_jitter_mean ?? 0) * 100)).toFixed(2)}%</p></CardContent></Card>
              <Card className="bg-[#F9FAFB]"><CardContent className="p-5"><p className="text-sm uppercase tracking-[0.18em] text-[#6B7280]">Baseline shimmer</p><p className="mt-2 text-3xl font-semibold">{baseline.baseline_shimmer_mean?.toFixed(2) ?? "-"}%</p></CardContent></Card>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
