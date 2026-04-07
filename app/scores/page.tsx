import { MetricGauge } from "@/components/MetricGauge";
import { PageIntro } from "@/components/PageIntro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDashboardSummary } from "@/lib/server/current-user";
import { interpretHnr, interpretJitter, interpretShimmer } from "@/lib/metrics";

export default async function ScoresPage() {
  const summary = await getCurrentDashboardSummary();
  if (!summary) return null;
  const latest = summary.latestSession;

  const hnr = latest?.hnr_mean ?? 0;
  const jitter = (latest?.jitter_local ?? 0) * 100;
  const shimmer = latest?.shimmer_local ?? 0;
  const latestPro = summary.latestProAssessment;
  const previousPro = summary.proAssessments.length > 1
    ? summary.proAssessments[summary.proAssessments.length - 2]
    : null;
  const proTrend = (current: number, previous: number | null) =>
    previous == null ? "flat" : current > previous ? "up" : current < previous ? "down" : "flat";

  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        <PageIntro
          eyebrow="Scores"
          title="What your scores mean"
          body="These scores describe how clear, steady, and even your voice was today. RecurVoice compares them to your own baseline first, then shows where they sit beside reference groups."
        />
        <Card className="bg-[#F9FAFB]">
          <CardContent className="space-y-4 p-6 text-lg leading-8 text-[#4B5563]">
            <p>
              For the most accurate check-in, use a quiet room, hold the device still, take one deep breath, say AHHHH at your normal speaking volume, keep the sound steady, and read the sentence naturally without whispering or rushing.
            </p>
            <p>
              One day by itself is never the whole story. RecurVoice is strongest when it can compare today&apos;s voice with your own 14-day baseline and watch how the numbers move over time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-3xl">Harmonic-to-Noise Ratio - HNR</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-8 text-[#4B5563]">Think of HNR as a voice clarity score. A higher number usually means your voice sounded cleaner and less rough. A lower number means there was more breathiness or roughness mixed into the sound.</p>
            <MetricGauge label="Current HNR" valueLabel={`${hnr.toFixed(1)} dB`} indicator={Math.min(100, (hnr / 25) * 100)} sections={[{ color: "bg-red-200", width: 40, label: "Reduced" }, { color: "bg-amber-200", width: 20, label: "Slightly reduced" }, { color: "bg-green-200", width: 40, label: "Normal" }]} />
            <p className={`text-lg font-semibold ${interpretHnr(hnr).tone}`}>{interpretHnr(hnr).label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-3xl">Jitter - Voice steadiness</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-8 text-[#4B5563]">Think of jitter as tiny pitch wobble. A lower number means the note in your voice stayed steadier. A higher number means the pitch bounced around more from moment to moment.</p>
            <MetricGauge label="Current jitter" valueLabel={`${jitter.toFixed(2)}%`} indicator={Math.min(100, (jitter / 3) * 100)} sections={[{ color: "bg-green-200", width: 33, label: "Normal" }, { color: "bg-amber-200", width: 33, label: "Slightly elevated" }, { color: "bg-red-200", width: 34, label: "Elevated" }]} />
            <p className={`text-lg font-semibold ${interpretJitter(jitter).tone}`}>{interpretJitter(jitter).label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-3xl">Shimmer - Volume consistency</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-8 text-[#4B5563]">Think of shimmer as tiny loudness wobble. A lower number means the strength of the voice stayed more even. A higher number means the loudness bounced around more from one cycle to the next.</p>
            <MetricGauge label="Current shimmer" valueLabel={`${shimmer.toFixed(2)}%`} indicator={Math.min(100, (shimmer / 6) * 100)} sections={[{ color: "bg-green-200", width: 33, label: "Normal" }, { color: "bg-amber-200", width: 33, label: "Slightly elevated" }, { color: "bg-red-200", width: 34, label: "Elevated" }]} />
            <p className={`text-lg font-semibold ${interpretShimmer(shimmer).tone}`}>{interpretShimmer(shimmer).label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-3xl">Your drift score</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-8 text-[#4B5563]">Your drift score tracks whether your voice is gradually changing over time. A score under 2 means your voice is stable. A score above 4 that stays high for several days means we noticed a consistent change worth mentioning to your care team.</p>
            <MetricGauge label="CUSUM" valueLabel={`${(summary.baseline?.current_cusum_score ?? 0).toFixed(2)}`} indicator={((summary.baseline?.current_cusum_score ?? 0) / 5) * 100} sections={[{ color: "bg-green-200", width: 40, label: "Stable" }, { color: "bg-amber-200", width: 20, label: "Watch" }, { color: "bg-orange-200", width: 20, label: "Early" }, { color: "bg-red-200", width: 20, label: "Urgent" }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your weekly symptom scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-8 text-[#4B5563]">
              These short weekly questions help RecurVoice understand whether your voice changes are happening alongside changes in how you feel.
            </p>
            {latestPro ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    label: "Activity level",
                    value: latestPro.ecog_score,
                    max: 4,
                    direction: proTrend(latestPro.ecog_score, previousPro?.ecog_score ?? null),
                    meaning: latestPro.ecog_score <= 1 ? "You stayed mostly active." : latestPro.ecog_score <= 2 ? "Your activity was somewhat limited." : "Your activity was heavily limited."
                  },
                  {
                    label: "Cough",
                    value: latestPro.cough_score,
                    max: 3,
                    direction: proTrend(latestPro.cough_score, previousPro?.cough_score ?? null),
                    meaning: latestPro.cough_score <= 1 ? "Cough stayed mild." : latestPro.cough_score === 2 ? "Cough got in the way sometimes." : "Cough was hard to manage."
                  },
                  {
                    label: "Shortness of breath",
                    value: latestPro.dyspnea_score,
                    max: 3,
                    direction: proTrend(latestPro.dyspnea_score, previousPro?.dyspnea_score ?? null),
                    meaning: latestPro.dyspnea_score <= 1 ? "Breathing symptoms stayed mild." : latestPro.dyspnea_score === 2 ? "Breathing felt moderately limited." : "Breathing felt very difficult."
                  },
                  {
                    label: "Fatigue",
                    value: latestPro.fatigue_score,
                    max: 3,
                    direction: proTrend(latestPro.fatigue_score, previousPro?.fatigue_score ?? null),
                    meaning: latestPro.fatigue_score <= 1 ? "Tiredness stayed mild." : latestPro.fatigue_score === 2 ? "Tiredness got in the way." : "Tiredness made daily activity hard."
                  },
                  {
                    label: "Pain",
                    value: latestPro.pain_score,
                    max: 3,
                    direction: proTrend(latestPro.pain_score, previousPro?.pain_score ?? null),
                    meaning: latestPro.pain_score <= 1 ? "Pain stayed mild." : latestPro.pain_score === 2 ? "Pain was moderate." : "Pain was severe."
                  }
                ].map((metric) => (
                  <Card key={metric.label} className="bg-white">
                    <CardContent className="space-y-4 p-5">
                      <p className="text-xl font-semibold">{metric.label}</p>
                      <MetricGauge
                        label={metric.label}
                        valueLabel={`${metric.value} / ${metric.max}`}
                        indicator={(metric.value / metric.max) * 100}
                        sections={[
                          { color: "bg-green-200", width: 34, label: "Mild" },
                          { color: "bg-amber-200", width: 33, label: "Moderate" },
                          { color: "bg-red-200", width: 33, label: "Severe" }
                        ]}
                      />
                      <p className="text-base leading-7 text-[#4B5563]">{metric.meaning}</p>
                      <p className="text-sm font-semibold text-[#1B4332]">
                        Trend: {metric.direction === "up" ? "Higher than last time" : metric.direction === "down" ? "Lower than last time" : "About the same"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-lg leading-8 text-[#4B5563]">
                Complete your first weekly symptom check-in to see this section.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
